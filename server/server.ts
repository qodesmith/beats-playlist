import type {Video} from '@qodestack/dl-yt-playlist'

import fs from 'node:fs'
import path from 'node:path'

import {$} from 'bun'
import dotenv from 'dotenv'
import {Hono} from 'hono'

import {gzip} from './gzipMiddleware'
import {deletePlaylistItem} from './youtubeApi'

// Load secret env vars from the Unraid server.
dotenv.config({path: '/youtube_auth/download-youtube-beats.env'})

// Beats longer than this value will not be returned.
const MAX_DURATION_SECONDS = Number(Bun.env.MAX_DURATION_SECONDS) || 60 * 8
const {
  SERVER_PORT,
  NODE_ENV,
  FETCHNOW_QUERY_KEY,
  FETCHNOW_QUERY_VALUE,
  BEATS_CRON_CONTAINER_NAME,
  BEATS_CRON_CONTAINER_PORT,
} = process.env
const app = new Hono()

const beatsBasePath =
  NODE_ENV === 'production'
    ? '/beats'
    : path.resolve(import.meta.dirname, '../public/beats')

////////////////
// MIDDLEWARE //
////////////////

/**
 * Currently using a custom gzip middleware since Hono's `hono/compress`
 * middleware doesn't currently work with Bun.
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
 * When Vite builds for production, the resulting `index.html` file will make
 * script and link calls to `/assets` for JS and CSS. This endpoint is never
 * explicitly hit via client code.
 */
app.get('/assets/:file', c => {
  const file = c.req.param('file')
  return new Response(Bun.file(`/app/assets/${file}`))
})

/**
 * Favicon.
 *
 * This endpoint will be served by Vite during development.
 */
app.get('/play-logo.png', () => new Response(Bun.file('/app/play-logo.png')))

/////////
// API //
/////////

app.get('/api/metadata', async c => {
  const metadata: Video[] = await Bun.file(
    `${beatsBasePath}/metadata.json`
  ).json()

  // Filter out videos we don't have an mp3 file for or that are too long.
  const filteredVideos = metadata.filter(
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

app.get('/api/unknown-metadata', async c => {
  const metadata: Video[] = await Bun.file(
    `${beatsBasePath}/metadata.json`
  ).json()
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

app.get('/api/thumbnails/:id', c => {
  const id = c.req.param('id')

  return new Response(Bun.file(`${beatsBasePath}/thumbnails/${id}.jpg`), {
    headers: {
      // Cache for 1 year
      'Cache-Control': 'public, max-age=31536000',
      // Set expiration date
      Expires: new Date(Date.now() + 31536000000).toUTCString(),
    },
  })
})

app.get('/api/beats/:id', c => {
  const id = c.req.param('id')
  return new Response(Bun.file(`${beatsBasePath}/audio/${id}.mp3`))
})

// TODO - add authentication to this route
app.delete('/api/delete/:id', async c => {
  const id = c.req.param('id')

  try {
    const {status, statusText} = await deletePlaylistItem(id)

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
  if (
    !FETCHNOW_QUERY_KEY ||
    !FETCHNOW_QUERY_VALUE ||
    !BEATS_CRON_CONTAINER_NAME ||
    !BEATS_CRON_CONTAINER_PORT
  ) {
    return c.json({error: 'Server error'}, 500)
  }

  const queryObj = c.req.query()
  const hasMatch = queryObj[FETCHNOW_QUERY_KEY] === FETCHNOW_QUERY_VALUE

  if (!hasMatch) {
    return c.json({error: 'Unathorized'}, 401)
  }

  return fetch(
    `http://${BEATS_CRON_CONTAINER_NAME}:${BEATS_CRON_CONTAINER_PORT}`,
    {method: 'POST'}
  )
})

export default {port: SERVER_PORT, fetch: app.fetch}

console.log(`🔥 Server running at http://localhost:${SERVER_PORT}`)
