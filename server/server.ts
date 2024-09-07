import type {Video} from '@qodestack/dl-yt-playlist'

import fs from 'node:fs'

import {serverTiming} from '@elysiajs/server-timing'
import {$} from 'bun'
import {Elysia, t} from 'elysia'

import {gzip} from './gzip'
import {db} from './mongo'
import {deletePlaylistItem} from './youtubeApi'

const {SERVER_PORT, SESSION_COOKIE_NAME} = Bun.env

// Beats longer than this value will not be returned.
const MAX_DURATION_SECONDS = Number(Bun.env.MAX_DURATION_SECONDS) || 60 * 8

if (SERVER_PORT === undefined) {
  throw new Error('SERVER_PORT not defined')
}

const app = new Elysia({name: 'beats-playlist'})
  // Plugins / middleware.
  .use(serverTiming())
  .use(gzip)

  // Sessions.
  .derive(async ({cookie}) => {
    const sessionCookie = cookie[SESSION_COOKIE_NAME ?? '']
    const sessionId = sessionCookie.value

    if (sessionId) {
      const userSession = await db
        .collection('sessions')
        .findOne({id: sessionId})

      if (userSession) {
        return {session: userSession}
      } else {
        sessionCookie.remove()
        return {session: null}
      }
    }

    return {session: null}
  })

  // Frontend assets.
  .get('/play-logo.png', () => Bun.file('/app/play-logo.png'))
  .get('/', () => Bun.file('/app/index.html'))
  .get('/assets/:file', ({params: {file}}) => Bun.file(`/app/assets/${file}`))

  // API
  .get('/metadata', async (/*{query}*/) => {
    const metadata: Video[] = await Bun.file('/beats/metadata.json').json()

    // Filter out videos we don't have an mp3 file for or that are too long.
    const filteredVideos = metadata.filter(
      ({audioFileExtension, durationInSeconds}) => {
        return !!audioFileExtension && durationInSeconds <= MAX_DURATION_SECONDS
      }
    )

    return {metadata: filteredVideos}

    // Paginated version:
    // const page = Number(query.page) || 1
    // const limit = Number(query.limit) || 50
    // const startIndex = (page - 1) * limit
    // const endIndex = page * limit

    // const metadata: Video[] = await Bun.file('/beats/metadata.json').json()
    // const paginatedMetadata = metadata.slice(startIndex, endIndex)

    // return {
    //   page,
    //   limit,
    //   total: metadata.length,
    //   data: paginatedMetadata,
    // }
  })
  .get('/unknown-metadata', async () => {
    const metadata: Video[] = await Bun.file('/beats/metadata.json').json()
    const allIdsSet = new Set(metadata.map(({id}) => id))

    // Filter out videos we don't have an mp3 file for or that are too long.
    const filteredVideos = metadata.filter(
      ({audioFileExtension, durationInSeconds}) => {
        return !!audioFileExtension && durationInSeconds <= MAX_DURATION_SECONDS
      }
    )
    const filteredVideosSet = new Set(
      filteredVideos.map(v => `${v.id}.${v.audioFileExtension}`)
    )
    const unknownMetadataFileNames = fs
      .readdirSync('/beats/audio')
      .filter(item => {
        return !filteredVideosSet.has(item) && !allIdsSet.has(item.slice(0, -4))
      })

    const unknownMetadata: Video[] = []
    const failures: string[] = []

    for (const fileName of unknownMetadataFileNames) {
      const filePath = `/beats/audio/${fileName}`
      const id = fileName.slice(0, -4)

      try {
        const json =
          await $`ffprobe -v quiet -print_format json -show_format ${filePath}`.json()
        const durationInSeconds = Math.round(Number(json.format.duration))

        unknownMetadata.push({
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
          durationInSeconds,
          audioFileExtension: 'mp3',
          videoFileExtension: null,
          url: '#',
          isUnavailable: true,
          lufs: -14,
        })
      } catch (err) {
        failures.push(id)
      }
    }

    return {unknownMetadata, failures}
  })
  .get('/thumbnails/:id', ({params: {id}}) => {
    return new Response(Bun.file(`/beats/thumbnails/${id}.jpg`), {
      headers: {
        // Cache for 1 year
        'Cache-Control': 'public, max-age=31536000',
        // Set expiration date
        Expires: new Date(Date.now() + 31536000000).toUTCString(),
      },
    })
  })
  .get('/beats/:id', ({params: {id}}) => Bun.file(`/beats/audio/${id}.mp3`))

  // TODO - add authentication to this route
  .post('/delete/:id', async ({params: {id}}) => {
    try {
      const {status, statusText} = await deletePlaylistItem(id)

      if (status >= 200 && status < 300) {
        return true
      } else {
        throw {status, statusText}
      }
    } catch (error) {
      return {error}
    }
  })
  .post(
    '/login',
    async ({body}) => {
      return {data: body}
    },
    {body: t.Object({username: t.String(), password: t.String()})}
  )
  .listen(SERVER_PORT)

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
)
