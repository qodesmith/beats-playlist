/**
 * NOTE!
 * These tests assume a local SQLite database populated with data.
 */

import {describe, expect, it, beforeEach, mock} from 'bun:test'
import {app} from '../server'
import {Video} from '@qodestack/dl-yt-playlist'
import {getDatabase} from '../sqlite/db'
import {beatsTable} from '../sqlite/schema'
import {eq, not} from 'drizzle-orm'

mock.module('../youtubeApi', () => {
  return {
    deletePlaylistItem: async () => {
      return {status: 299, statusText: 'We good!'}
    },
  }
})

beforeEach(async () => {
  await getDatabase({fresh: true})
})

describe('POST /api/ids-for-download', () => {
  it('should return a list of ids for download', async () => {
    const res = await app.request('/api/ids-for-download', {
      method: 'POST',
      body: JSON.stringify({
        email: Bun.env.EMAIL,
        password: Bun.env.PASSWORD,
        ids: ['1', 'test', '2'],
      }),
    })
    const json = await res.json()

    expect(res.status).toBe(200)
    expect(json).toEqual({idsForDownload: ['1', '2']})
  })
})

describe('POST /api/beats', () => {
  it('should add new beats to the database', async () => {
    const misShapedBeat = {a: 1}
    const beats: Video[] = [
      // This beat is shaped correctly.
      {
        audioFileExtension: 'mp3',
        channelId: 'channelId-test',
        channelName: 'channelName-test',
        channelUrl: 'channelUrl-test',
        dateAddedToPlaylist: new Date().toISOString(),
        dateCreated: new Date(2000, 0, 1).toISOString(),
        description: 'description-test',
        durationInSeconds: 120,
        id: 'id-test',
        isUnavailable: false,
        lufs: -9,
        playlistItemId: 'playlistItemId-test',
        thumbnailUrls: ['thumbnailUrl-test'],
        title: 'title-test',
        url: 'url-test',
        videoFileExtension: null,
      },

      // @ts-expect-error this beat is mis-shaped on purpose.
      misShapedBeat,
    ]

    const res = await app.request('/api/beats', {
      method: 'POST',
      body: JSON.stringify({
        email: Bun.env.EMAIL,
        password: Bun.env.PASSWORD,
        beats,
      }),
    })
    const json = await res.json()

    expect(res.status).toBe(200)
    expect(json.error).toBeNull()
    expect(json.inserted).toEqual([beats[0].id])
    expect(json.failedToParse).toHaveLength(1)
    expect(json.failedToParse[0].beat).toEqual(misShapedBeat)
    expect(json.failedToParse[0]).toHaveProperty('issues')
    expect(json.failedToParse[0].issues).toBeArray()
    expect(json.failedToParse[0].issues.length).toBeGreaterThan(0)
  })

  it('should not add beats if none are provided', async () => {
    const res = await app.request('/api/beats', {
      method: 'POST',
      body: JSON.stringify({
        email: Bun.env.EMAIL,
        password: Bun.env.PASSWORD,
        beats: [],
      }),
    })
    const json = await res.json()

    expect(res.status).toBe(200)
    expect(json).toEqual({error: null, inserted: [], failedToParse: []})
  })
})

describe('GET /api/metadata', () => {
  it('should return 500 for invalid query params', async () => {
    const validIsoDate = new Date().toISOString()
    const [res1, res2, res3, res4, res5] = await Promise.all([
      app.request('/api/metadata'),
      app.request('/api/metadata?isoDate=nope&limit=1'),
      app.request(`/api/metadata?isoDate=${validIsoDate}`),
      app.request(`/api/metadata?isoDate=${validIsoDate}&limit=yo`),
      app.request(`/api/metadata?isoDate=${validIsoDate}&limit=1`),
      app.request('/api/metadata?limit=1'),
    ])

    expect(res1.status).toBe(500)
    expect(res2.status).toBe(500)
    expect(res3.status).toBe(500)
    expect(res4.status).toBe(500)
    expect(res5.status).toBe(200)
    expect(res4.status).toBe(500)
  })

  it('should return beats <= to an ISO date', async () => {
    const isoDate = new Date(2024, 6, 9).toISOString()
    const res = await app.request(`/api/metadata?isoDate=${isoDate}&limit=100`)
    const json = await res.json()

    expect(res.status).toBe(200)
    expect(json.total).toBe(12)
    expect(json.metadata).toHaveLength(3)
  })

  it('should return beats <= to a maximum duration', async () => {
    const originalMaxDuration = Bun.env.MAX_DURATION_SECONDS
    Bun.env.MAX_DURATION_SECONDS = '30'

    const isoDate = new Date().toISOString()
    const res1 = await app.request(`/api/metadata?isoDate=${isoDate}&limit=100`)
    const json = await res1.json()

    expect(res1.status).toBe(200)
    expect(json).toEqual({
      total: 1,
      metadata: [
        {
          id: 'test',
          playlistItemId: 'test',
          title: 'Web Audio API Test Track',
          description: 'A test track for working with the Web Audio API',
          channelId: 'none',
          channelName: 'Qodesmith',
          dateCreated: '2024-11-02T11:42:21.686Z',
          dateAddedToPlaylist: '2024-11-02T11:42:21.686Z',
          thumbnailUrls: [],
          durationInSeconds: 16,
          url: '#',
          channelUrl: '#',
          audioFileExtension: 'mp3',
          videoFileExtension: null,
          isUnavailable: false,
          lufs: null,
        },
      ],
    })

    Bun.env.MAX_DURATION_SECONDS = '1'
    const res2 = await app.request(`/api/metadata?isoDate=${isoDate}&limit=100`)
    const json2 = await res2.json()

    expect(json2).toEqual({total: 0, metadata: []})

    Bun.env.MAX_DURATION_SECONDS = originalMaxDuration
  })

  it('should return beats that have an audio extension', async () => {
    const db = await getDatabase()
    const allBeats1 = await db.select().from(beatsTable)

    expect(allBeats1).toHaveLength(12)

    const id = `id-${Date.now()}`
    const inserted = await db
      .insert(beatsTable)
      .values([
        {
          audioFileExtension: null,
          channelId: 'channelId-test',
          channelName: 'channelName-test',
          channelUrl: 'channelUrl-test',
          dateAddedToPlaylist: new Date().toISOString(),
          dateCreated: new Date(2000, 0, 1).toISOString(),
          description: 'description-test',
          durationInSeconds: 120,
          id,
          isUnavailable: false,
          lufs: -9,
          playlistItemId: 'playlistItemId-test',
          thumbnailUrls: ['thumbnailUrl-test'],
          title: 'title-test',
          url: 'url-test',
          videoFileExtension: null,
        },
      ])
      .returning({id: beatsTable.id})

    expect(inserted).toHaveLength(1)

    const allBeats2 = await db.select().from(beatsTable)
    expect(allBeats2).toHaveLength(13)

    const isoDate = new Date().toISOString()
    const res = await app.request(`/api/metadata?isoDate=${isoDate}&limit=100`)
    const json = await res.json()

    expect(res.status).toBe(200)
    expect(json.total).toBe(12)
    expect(json.metadata).toHaveLength(12)
  })

  it('should limit the number of beats returned', async () => {
    const isoDate = new Date().toISOString()
    const res1 = await app.request(`/api/metadata?isoDate=${isoDate}&limit=1`)
    const json1 = await res1.json()
    const res2 = await app.request(`/api/metadata?isoDate=${isoDate}&limit=10`)
    const json2 = await res2.json()

    expect(res1.status).toBe(200)
    expect(res2.status).toBe(200)
    expect(json1.total).toBe(12)
    expect(json2.total).toBe(12)
    expect(json1.metadata).toHaveLength(1)
    expect(json2.metadata).toHaveLength(10)
  })

  it('should return beats in descending date order', async () => {
    const isoDate = new Date().toISOString()
    const res = await app.request(`/api/metadata?isoDate=${isoDate}&limit=100`)
    const json = await res.json()
    const metadata = json.metadata as Video[]
    const dates = metadata.map(({dateAddedToPlaylist}) => dateAddedToPlaylist)
    const sortedDates = dates.toSorted().reverse()

    expect(res.status).toBe(200)
    expect(dates).toEqual(sortedDates)
  })

  it('should paginate the results', async () => {
    const isoDate1 = new Date().toISOString()
    const res1 = await app.request(`/api/metadata?isoDate=${isoDate1}&limit=5`)
    const json1 = await res1.json()
    const metadata1 = json1.metadata as Video[]

    expect(res1.status).toBe(200)
    expect(json1.total).toBe(12)
    expect(metadata1).toHaveLength(5)

    const isoDate2 = metadata1.at(-1)!.dateAddedToPlaylist
    const res2 = await app.request(`/api/metadata?isoDate=${isoDate2}&limit=5`)
    const json2 = await res2.json()
    const metadata2 = json2.metadata as Video[]

    expect(res2.status).toBe(200)
    expect(json2.total).toBe(12)
    expect(metadata2).toHaveLength(5)
    expect(metadata2).not.toContainAnyValues(metadata1)

    const isoDate3 = metadata2.at(-1)!.dateAddedToPlaylist
    const res3 = await app.request(`/api/metadata?isoDate=${isoDate3}&limit=5`)
    const json3 = await res3.json()
    const metadata3 = json3.metadata as Video[]

    expect(res3.status).toBe(200)
    expect(json3.total).toBe(12)
    expect(metadata3).toHaveLength(2)
    expect(metadata3).not.toContainAnyValues(metadata2)

    const isoDate4 = metadata3.at(-1)!.dateAddedToPlaylist
    const res4 = await app.request(`/api/metadata?isoDate=${isoDate4}&limit=5`)
    const json4 = await res4.json()
    const metadata4 = json4.metadata as Video[]

    expect(res4.status).toBe(200)
    expect(json4.total).toBe(12)
    expect(metadata4).toHaveLength(0)
  })
})

describe('GET /api/new-metadata', () => {
  it('should return 500 for invalid query params', async () => {
    const validIsoDate = new Date().toISOString()
    const [res1, res2, res3] = await Promise.all([
      app.request('/api/new-metadata'),
      app.request('/api/new-metadata?isoDate=nope'),
      app.request(`/api/new-metadata?isoDate=${validIsoDate}`),
    ])

    expect(res1.status).toBe(500)
    expect(res2.status).toBe(500)
    expect(res3.status).toBe(200)
  })

  it('should return beats in descending date order', async () => {
    const isoDate = new Date().toISOString()
    const nextYear = new Date().getFullYear() + 1

    const db = await getDatabase()
    await db.insert(beatsTable).values([
      {
        audioFileExtension: 'mp3',
        channelId: 'channelId-test',
        channelName: 'channelName-test',
        channelUrl: 'channelUrl-test',
        dateAddedToPlaylist: new Date(nextYear, 0, 1).toISOString(),
        dateCreated: new Date(2000, 0, 1).toISOString(),
        description: 'description-test',
        durationInSeconds: 120,
        id: 'beat1',
        isUnavailable: false,
        lufs: -9,
        playlistItemId: 'playlistItemId-test',
        thumbnailUrls: ['thumbnailUrl-test'],
        title: 'title-test',
        url: 'url-test',
        videoFileExtension: null,
      },
      {
        audioFileExtension: 'mp3',
        channelId: 'channelId-test',
        channelName: 'channelName-test',
        channelUrl: 'channelUrl-test',
        dateAddedToPlaylist: new Date(nextYear, 0, 2).toISOString(),
        dateCreated: new Date(2000, 0, 1).toISOString(),
        description: 'description-test',
        durationInSeconds: 120,
        id: 'beat2',
        isUnavailable: false,
        lufs: -9,
        playlistItemId: 'playlistItemId-test',
        thumbnailUrls: ['thumbnailUrl-test'],
        title: 'title-test',
        url: 'url-test',
        videoFileExtension: null,
      },
    ])

    const res = await app.request(`/api/new-metadata?isoDate=${isoDate}`)
    const json = await res.json()
    const metadata = json.metadata as Video[]
    const dates = metadata.map(({dateAddedToPlaylist}) => dateAddedToPlaylist)
    const sortedDates = dates.toSorted().reverse()

    expect(res.status).toBe(200)
    expect(metadata).toHaveLength(2)
    expect(dates).toEqual(sortedDates)
    expect(metadata[0].id).toBe('beat2')
    expect(metadata[1].id).toBe('beat1')
  })

  it('should return beats <= to a maximum duration', async () => {
    const isoDate = new Date().toISOString()
    const nextYear = new Date().getFullYear() + 1
    const values: Video[] = [
      {
        audioFileExtension: 'mp3',
        channelId: 'channelId-test',
        channelName: 'channelName-test',
        channelUrl: 'channelUrl-test',
        dateAddedToPlaylist: new Date(nextYear, 0, 1).toISOString(),
        dateCreated: new Date(2000, 0, 1).toISOString(),
        description: 'description-test',
        durationInSeconds: 10_000,
        id: 'beat1',
        isUnavailable: false,
        lufs: -9,
        playlistItemId: 'playlistItemId-test',
        thumbnailUrls: ['thumbnailUrl-test'],
        title: 'title-test',
        url: 'url-test',
        videoFileExtension: null,
      },
      {
        audioFileExtension: 'mp3',
        channelId: 'channelId-test',
        channelName: 'channelName-test',
        channelUrl: 'channelUrl-test',
        dateAddedToPlaylist: new Date(nextYear, 0, 2).toISOString(),
        dateCreated: new Date(2000, 0, 1).toISOString(),
        description: 'description-test',
        durationInSeconds: 120,
        id: 'beat2',
        isUnavailable: false,
        lufs: -9,
        playlistItemId: 'playlistItemId-test',
        thumbnailUrls: ['thumbnailUrl-test'],
        title: 'title-test',
        url: 'url-test',
        videoFileExtension: null,
      },
    ]

    const allBeats1 = await getDatabase().select().from(beatsTable)
    await getDatabase().insert(beatsTable).values(values)
    const allBeats2 = await getDatabase().select().from(beatsTable)

    expect(allBeats1).toHaveLength(12)
    expect(allBeats2).toHaveLength(14)

    const res = await app.request(`/api/new-metadata?isoDate=${isoDate}`)
    const json = await res.json()

    expect(res.status).toBe(200)
    expect(json).toEqual({metadata: [values[1]]})
  })

  it('should return beats that have an audio extension', async () => {
    const isoDate = new Date().toISOString()
    const nextYear = new Date().getFullYear() + 1
    const values: Video[] = [
      {
        audioFileExtension: null,
        channelId: 'channelId-test',
        channelName: 'channelName-test',
        channelUrl: 'channelUrl-test',
        dateAddedToPlaylist: new Date(nextYear, 0, 1).toISOString(),
        dateCreated: new Date(2000, 0, 1).toISOString(),
        description: 'description-test',
        durationInSeconds: 120,
        id: 'beat1',
        isUnavailable: false,
        lufs: -9,
        playlistItemId: 'playlistItemId-test',
        thumbnailUrls: ['thumbnailUrl-test'],
        title: 'title-test',
        url: 'url-test',
        videoFileExtension: null,
      },
      {
        audioFileExtension: 'mp3',
        channelId: 'channelId-test',
        channelName: 'channelName-test',
        channelUrl: 'channelUrl-test',
        dateAddedToPlaylist: new Date(nextYear, 0, 2).toISOString(),
        dateCreated: new Date(2000, 0, 1).toISOString(),
        description: 'description-test',
        durationInSeconds: 120,
        id: 'beat2',
        isUnavailable: false,
        lufs: -9,
        playlistItemId: 'playlistItemId-test',
        thumbnailUrls: ['thumbnailUrl-test'],
        title: 'title-test',
        url: 'url-test',
        videoFileExtension: null,
      },
    ]

    const allBeats1 = await getDatabase().select().from(beatsTable)
    await getDatabase().insert(beatsTable).values(values)
    const allBeats2 = await getDatabase().select().from(beatsTable)

    expect(allBeats1).toHaveLength(12)
    expect(allBeats2).toHaveLength(14)

    const res = await app.request(`/api/new-metadata?isoDate=${isoDate}`)
    const json = await res.json()

    expect(res.status).toBe(200)
    expect(json).toEqual({metadata: [values[1]]})
  })
})

describe('GET /api/unknown-metadata', async () => {
  it('should return beats on disk that are not in the database', async () => {
    const res = await app.request('/api/unknown-metadata')
    const json = await res.json()
    const id = 'unknown'

    expect(res.status).toBe(200)
    expect(json).toEqual({
      unknownMetadata: [
        {
          id,
          playlistItemId: '',
          title: `Unknown - ${id}`,
          description: '',
          channelId: '',
          channelName: '-',
          channelUrl: '#',
          dateCreated: '',
          dateAddedToPlaylist: '',
          thumbnailUrls: [],
          durationInSeconds: 16,
          audioFileExtension: 'mp3',
          videoFileExtension: null,
          url: '#',
          isUnavailable: true,
          lufs: -14,
        },
      ],
      failures: [],
    })
  })
})

describe('GET /api/thumbnails/:id', async () => {
  it('should return a thumbnail for a beat (regular and small)', async () => {
    const [{id}] = await getDatabase()
      .select()
      .from(beatsTable)
      .limit(1)
      .where(not(eq(beatsTable.id, 'test')))

    const res1 = await app.request(`/api/thumbnails/${id}`)
    const res2 = await app.request(`/api/thumbnails/${id}[small]`)

    expect(res1.status).toBe(200)
    expect(res2.status).toBe(200)
    expect(res1.headers.get('Cache-Control')).toBe('public, max-age=31536000')
    expect(res2.headers.get('Cache-Control')).toBe('public, max-age=31536000')
    expect(res1.headers.get('Expires')).toBeString()
    expect(res2.headers.get('Expires')).toBeString()
    expect(res1.headers.get('Content-Type')).toBe('image/jpeg')
    expect(res2.headers.get('Content-Type')).toBe('image/jpeg')
  })

  it('should return 404 for a thumbnail that does not exist', async () => {
    const res = await app.request('/api/thumbnails/test')

    expect(res.status).toBe(404)
  })
})

describe('GET /api/beats/:id', async () => {
  it('should return an mp3 file for a beat', async () => {
    const res = await app.request('/api/beats/test')

    expect(res.status).toBe(200)
    expect(res.headers.get('content-type')).toBe('audio/mpeg')
  })

  it('should return 404 for a beat that does not exist', async () => {
    const res = await app.request('/api/beats/nope')

    expect(res.status).toBe(404)
  })
})

// TODO
describe.skip('DELETE /api/delete/:playlistItemId', async () => {
  it('should delete a beat from the database', async () => {
    const res = await app.request('/api/delete/', {method: 'DELETE'})
  })
})
