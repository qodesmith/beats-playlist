import type {Video} from '@qodestack/dl-yt-playlist'

import fs from 'node:fs'
import path from 'node:path'

import {VideoSchema} from '@qodestack/dl-yt-playlist/schemas'
import {safeParse} from 'valibot'

import {$} from 'bun'
import dotenv from 'dotenv'
import {
  eq,
  inArray,
  desc,
  count,
  lte,
  and,
  isNotNull,
  gt,
  lt,
} from 'drizzle-orm'
import {Hono} from 'hono'
import {
  errorToObject,
  invariant,
  isValidDate,
  createLogger,
  emptyLog,
} from '@qodestack/utils'

import {gzip} from './gzipMiddleware'
import {getDatabase} from './sqlite/db'
import {beatsTable} from './sqlite/schema'
import {deletePlaylistItem} from './youtubeApi'
import {noDirectRequestMiddleware} from './noDirectRequestMiddleware'
import {cronOnlyMiddleware} from './cronOnlyMiddleware'

// Load secret env vars from the Unraid server.
dotenv.config({path: '/youtube_auth/download-youtube-beats.env'})

const isTest = process.env.NODE_ENV === 'test'
const log = isTest ? emptyLog : createLogger({timeZone: 'America/New_York'})
const {SERVER_PORT, NODE_ENV, FETCHNOW_QUERY_KEY, FETCHNOW_QUERY_VALUE} =
  process.env

const getMaxDuration = () => {
  // Beats longer than this value will not be returned.
  return Number(process.env.MAX_DURATION_SECONDS) || 60 * 8
}

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

export const app = new Hono<{Variables: Variables}>()

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

/**
 * Returned when trying to access assets (such as beats) directly.
 */
app.get('/forbidden.webm', () => new Response(Bun.file('/app/forbidden.webm')))

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

  if (!beats.length) {
    return c.json({
      error: null,
      inserted: [],
      failedToParse,
    })
  }

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
    return c.json({error: errorToObject(error), failedToParse})
  }
})

/////////
// API //
/////////

app.get('/api/metadata', noDirectRequestMiddleware, async c => {
  /**
   * This represents the 1st beat in the list. Newer beats may have been added
   * after the initial request, putting them "above" this beat, so we filter
   * those out by providing an explicit isoDate.
   */
  const isoDate = c.req.query('isoDate')
  const limit = c.req.query('limit')
  const page = c.req.query('page')
  const db = getDatabase()

  invariant(isoDate && isValidDate(new Date(isoDate)), 'Invalid date')
  invariant(limit ? !isNaN(+limit) : true, 'Invalid limit')
  invariant(limit ? (page ? !isNaN(+page) : true) : true, 'Invalid page')

  const andClause = and(
    /**
     * Beats may have been added to the playlist after the initial request.
     * Because we sort them in descending order, that can change what "page"
     * beats are on. The isoDate represents where the 1st beat starts from.
     */
    lt(beatsTable.dateAddedToPlaylist, isoDate),

    // Filter out beats that are too long.
    lte(beatsTable.durationInSeconds, getMaxDuration()),

    // Filter out beats that don't have an audio file extension.
    isNotNull(beatsTable.audioFileExtension)
  )

  const totalQuery = db
    .select({total: count()})
    .from(beatsTable)
    .where(andClause)

  const beatsQuery = db
    .select()
    .from(beatsTable)
    .orderBy(desc(beatsTable.dateAddedToPlaylist))
    .where(andClause)

  if (limit) {
    // We've already ensured that limit is a number above.
    beatsQuery.limit(+limit)

    if (page) {
      // We've already ensured that page is a number above.
      beatsQuery.offset((+page - 1) * +limit)
    }
  }

  const [[{total}], beats] = await Promise.all([totalQuery, beatsQuery])

  return c.json({total, metadata: beats})
})

app.get('/api/new-metadata', noDirectRequestMiddleware, async c => {
  const isoDate = c.req.query('isoDate')
  invariant(isoDate && isValidDate(new Date(isoDate)), 'Invalid date')

  const newBeats = await getDatabase()
    .select()
    .from(beatsTable)
    .orderBy(desc(beatsTable.dateAddedToPlaylist))
    .where(
      and(
        /**
         * This endpoint returns beats added after the initial app load. This
         * isoDate represents the first beat's `dateAddedToPlaylist` value.
         */
        gt(beatsTable.dateAddedToPlaylist, isoDate),

        // Filter out beats that are too long.
        lte(beatsTable.durationInSeconds, getMaxDuration()),

        // Filter out beats that don't have an audio file extension.
        isNotNull(beatsTable.audioFileExtension)
      )
    )

  return c.json({metadata: newBeats})
})

app.get('/api/unknown-metadata', noDirectRequestMiddleware, async c => {
  const db = getDatabase()
  const beats = await db
    .select()
    .from(beatsTable)
    .orderBy(desc(beatsTable.dateAddedToPlaylist))
    .where(
      and(
        // Filter out beats that are too long.
        lte(beatsTable.durationInSeconds, getMaxDuration()),

        // Filter out beats that don't have an audio file extension.
        isNotNull(beatsTable.audioFileExtension)
      )
    )
  const allIdsSet = new Set(beats.map(({id}) => id))

  const filteredBeatsSet = new Set(
    beats.map(v => `${v.id}.${v.audioFileExtension}`)
  )
  const unknownMetadataFileNames = fs
    .readdirSync(`${beatsBasePath}/audio`)
    .filter(item => {
      return !filteredBeatsSet.has(item) && !allIdsSet.has(item.slice(0, -4))
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
// app.delete('/api/delete/:playlistItemId', async c => {
//   if (Date.now()) {
//     return c.json({error: 'Not implementedd'})
//   }

//   const playlistItemId = c.req.param('playlistItemId')

//   try {
//     const db = getDatabase()

//     // Delete the item from the YouTube playlist.
//     const {status, statusText} = await deletePlaylistItem(playlistItemId)

//     // Delete the item from the database.
//     await db
//       .delete(beatsTable)
//       .where(eq(beatsTable.playlistItemId, playlistItemId))

//     if (status >= 200 && status < 300) {
//       return c.json({error: null})
//     } else {
//       throw {status, statusText}
//     }
//   } catch (error) {
//     return c.json({error: errorToObject(error)})
//   }
// })

app.post('/fetchnow', async c => {
  if (!FETCHNOW_QUERY_KEY || !FETCHNOW_QUERY_VALUE) {
    return c.json({error: 'Server error'}, 500)
  }

  const queryObj = c.req.query()
  const hasMatch = queryObj[FETCHNOW_QUERY_KEY] === FETCHNOW_QUERY_VALUE

  return hasMatch
    ? fetch('http://download-youtube-beats:10001', {method: 'POST'})
    : c.json({error: 'Unathorized'}, 401)
})

app.onError((error, c) => {
  const errorObj = errorToObject(error)
  log.error('URL:', c.req.url)
  log.error(errorObj)
  log.text(''.repeat(100))
  return c.text('Internal server error', 500)
})

const server = Bun.serve({
  port: SERVER_PORT,
  fetch: app.fetch,
})

console.log(`🔥 Server running at ${server.url}`)
