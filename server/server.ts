import type {Video} from '@qodestack/dl-yt-playlist'

import fs from 'node:fs'
import path from 'node:path'

import {VideoSchema} from '@qodestack/dl-yt-playlist/schemas'
import {safeParse} from 'valibot'

import {$} from 'bun'
import dotenv from 'dotenv'
import {eq, inArray, desc} from 'drizzle-orm'
import {Hono} from 'hono'

import {gzip} from './gzipMiddleware'
import {getDatabase} from './sqlite/db'
import {beatsTable} from './sqlite/schema'
import {deletePlaylistItem} from './youtubeApi'
import {noDirectRequestMiddleware} from './noDirectRequestMiddleware'
import {cronOnlyMiddleware} from './cronOnlyMiddleware'

// Load secret env vars from the Unraid server.
dotenv.config({path: '/youtube_auth/download-youtube-beats.env'})

// Beats longer than this value will not be returned.
const MAX_DURATION_SECONDS = Number(process.env.MAX_DURATION_SECONDS) || 60 * 8
const {SERVER_PORT, NODE_ENV, FETCHNOW_QUERY_KEY, FETCHNOW_QUERY_VALUE} =
  process.env

/**
 * These variables represent data that will be stored on the context. This will
 * make it type-safe to access.
 */
type Variables = {
  '/api/ids-for-download': {
    ids: string[]
  }
  '/api/beats': {
    beats: Video[]
  }
}

const app = new Hono<{Variables: Variables}>()

const beatsBasePath =
  NODE_ENV === 'production'
    ? '/beats'
    : path.resolve(import.meta.dirname, '../public/beats')

///////////////////////
// GLOBAL MIDDLEWARE //
///////////////////////

/**
 * Using a custom gzip middleware since Hono's `hono/compress` middleware
 * doesn't currently work with Bun.
 *
 * Once Bun implements `CompressionStream`, we can switch to Hono's
 * `hono/compress` middleware.
 *
 * https://github.com/oven-sh/bun/issues/1723
 */
app.use(gzip)

/////////////////////
// FRONTEND ASSETS //
/////////////////////

/**
 * index.html
 *
 * This endpoint will be served by Vite during development.
 */
app.get('/', () => new Response(Bun.file('/app/index.html')))

/**
 * https://vitejs.dev/config/build-options.html#build-assetsdir
 *
 * Static assets requested via the `indext.html` file.
 */
app.get('/assets/:file', c => {
  const fileName = c.req.param('file')
  const file = Bun.file(`/app/assets/${fileName}`)

  if (file.size === 0) {
    return new Response(null, {status: 404})
  }

  return new Response(file)
})

/**
 * Favicon.
 *
 * This endpoint will be served by Vite during development.
 */
app.get('/play-logo.png', () => new Response(Bun.file('/app/play-logo.png')))

/////////////////////////
// CRON-ONLY ENDPOINTS //
/////////////////////////

/**
 * The cron job will produce a list of ids for potential download. This endpoint
 * filters those ids down to those not in the database.
 */
app.post('/api/ids-for-download', cronOnlyMiddleware, async c => {
  const {ids} = c.get('/api/ids-for-download')

  const existingRecords = await getDatabase()
    .select({id: beatsTable.id})
    .from(beatsTable)
    .where(inArray(beatsTable.id, ids))

  const existingIdSet = new Set(existingRecords.map(({id}) => id))

  const idsForDownload = ids.filter(id => !existingIdSet.has(id))

  return c.json({idsForDownload})
})

app.post('/api/beats', cronOnlyMiddleware, async c => {
  const {beats} = c.get('/api/beats')
  const newBeats: Video[] = []
  const failedToParse: {beat: unknown; issues: unknown[]}[] = []

  beats.forEach(beat => {
    const parsed = safeParse(VideoSchema, beat)

    if (parsed.success) {
      newBeats.push(parsed.output)
    } else {
      failedToParse.push({beat, issues: parsed.issues})
    }
  })

  // Save beats to the database.
  try {
    const inserted = await getDatabase()
      .insert(beatsTable)
      .values(newBeats)
      .returning({id: beatsTable.id})

    return c.json({
      error: null,
      inserted: inserted.map(({id}) => id),
      failedToParse,
    })
  } catch (error) {
    return c.json({error, failedToParse})
  }
})

/////////
// API //
/////////

app.get('/api/metadata', noDirectRequestMiddleware, async c => {
  const db = getDatabase()
  const beats = await db
    .select()
    .from(beatsTable)
    .orderBy(desc(beatsTable.dateAddedToPlaylist))

  // Filter out videos we don't have an mp3 file for or that are too long.
  const filteredVideos = beats.filter(
    ({audioFileExtension, durationInSeconds}) => {
      return !!audioFileExtension && durationInSeconds <= MAX_DURATION_SECONDS
    }
  )

  return c.json({metadata: filteredVideos})

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

app.get('/api/unknown-metadata', noDirectRequestMiddleware, async c => {
  const db = getDatabase()
  const beats = await db.query.beatsTable.findMany()
  const allIdsSet = new Set(beats.map(({id}) => id))

  // Filter out videos we don't have an mp3 file for or that are too long.
  const filteredVideos = beats.filter(
    ({audioFileExtension, durationInSeconds}) => {
      return !!audioFileExtension && durationInSeconds <= MAX_DURATION_SECONDS
    }
  )
  const filteredVideosSet = new Set(
    filteredVideos.map(v => `${v.id}.${v.audioFileExtension}`)
  )
  const unknownMetadataFileNames = fs
    .readdirSync(`${beatsBasePath}/audio`)
    .filter(item => {
      return !filteredVideosSet.has(item) && !allIdsSet.has(item.slice(0, -4))
    })

  const unknownMetadata: Video[] = []
  const failures: string[] = []

  for (const fileName of unknownMetadataFileNames) {
    const filePath = `${beatsBasePath}/audio/${fileName}`
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

  return c.json({unknownMetadata, failures})
})

app.get('/api/thumbnails/:id', noDirectRequestMiddleware, c => {
  const id = c.req.param('id')
  const file = Bun.file(`${beatsBasePath}/thumbnails/${id}.jpg`)

  if (file.size === 0) {
    return new Response(null, {status: 404})
  }

  return new Response(file, {
    headers: {
      // Cache for 1 year
      'Cache-Control': 'public, max-age=31536000',
      // Set expiration date
      Expires: new Date(Date.now() + 31536000000).toUTCString(),
    },
  })
})

app.get('/api/beats/:id', noDirectRequestMiddleware, c => {
  const id = c.req.param('id')
  const file = Bun.file(`${beatsBasePath}/audio/${id}.mp3`)

  if (file.size === 0) {
    return new Response(null, {status: 404})
  }

  return new Response(file)
})

// TODO - add authentication to this route
app.delete('/api/delete/:playlistItemId', async c => {
  const playlistItemId = c.req.param('playlistItemId')

  try {
    const db = getDatabase()

    // Delete the item from the YouTube playlist.
    const {status, statusText} = await deletePlaylistItem(playlistItemId)

    // Delete the item from the database.
    await db
      .delete(beatsTable)
      .where(eq(beatsTable.playlistItemId, playlistItemId))

    if (status >= 200 && status < 300) {
      return c.json({error: null})
    } else {
      throw {status, statusText}
    }
  } catch (error) {
    return c.json({error})
  }
})

app.post('/fetchnow', async c => {
  if (!FETCHNOW_QUERY_KEY || !FETCHNOW_QUERY_VALUE) {
    return c.json({error: 'Server error'}, 500)
  }

  const queryObj = c.req.query()
  const hasMatch = queryObj[FETCHNOW_QUERY_KEY] === FETCHNOW_QUERY_VALUE

  return hasMatch
    ? fetch(`http://download-youtube-beats:10001`, {method: 'POST'})
    : c.json({error: 'Unathorized'}, 401)
})

const server = Bun.serve({
  port: SERVER_PORT,
  fetch: app.fetch,
})

console.log(`🔥 Server running at ${server.url}`)
