import {gzipSync, serve} from 'bun'
import process from 'node:process'

import {getRandomNumber} from '@qodestack/utils'

import index from '../index.html'

const server = serve({
  routes: {
    // Serve index.html for all unmatched routes.
    '/*': index,
    '/waveform/:id': ({params: {id}}) => {
      /**
       * Rough sketch of how to send the waveform data. Gzip compresses the
       * Uint8Array better than it does a JSON array of numbers.
       */
      const size = 1800
      const numbers = new Uint8Array(size)
      const _waveformNumbers = id // getBeatFromDb(id).waveformNumbers

      for (let i = 0; i < size; i++) {
        // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray#typedarray_objects
        numbers[i] = getRandomNumber(0, 255)
      }

      const compressed = gzipSync(numbers)

      // @ts-expect-error `compressed` is `Uint8Array<ArrayBufferLike>` which is acceptable here
      return new Response(compressed, {
        headers: {
          'Content-Type': 'application/octet-stream',
          'Content-Encoding': 'gzip',
        },
      })
    },

    /**
     * GET /forbidden.webm
     * Used in noDirectRequestMiddleware.ts which prevents direct access to beat
     * files by checking the headers for certain criteria, then responding with
     * a custom html string which includes loading forbidden.webm
     *
     * *********************
     * CRON-ONLY ENDPOINTS *
     * *********************
     *
     * POST /api/ids-for-download (cronOnlyMiddleware)
     * This endpoint is used by the cron job to know which beats it should
     * download. It receives a list of ids and returns a filtered list.
     *
     * POST /api/beats (cronOnlyMiddleware)
     * This endpoint updates the database with metadata for beats that were
     * recently downloaded by the cron job.
     *
     * *****
     * API *
     * *****
     *
     * GET /api/metadata (noDirectRequestMiddleware)
     * Returns beat metadata. Pagination seems to be set up.
     *
     * GET /api/new-metadata (noDirectRequestMiddleware)
     * Unused
     *
     * GET /api/unknown-metadata (noDirectRequestMiddleware)
     * Returns beat metadata for files on the filesystem but not in the db. Uses
     * ffprobe on the CLI to get the duration of the file.
     *
     * GET /api/thumbnails/:id (noDirectRequestMiddleware)
     * Thumbnail endpoint.
     *
     * GET /api/beats/:id (noDirectRequestMiddleware)
     * Audio mp3 endpoint.
     *
     * DELETE /api/delete/:playlistItemId
     * Never implemented. Endpoint to delete a beat from the YouTube playlist
     * and the file system.
     *
     * POST /fetchnow
     * Unraid Docker network only - manually triggers the cron job.
     */
  },

  development: process.env.NODE_ENV !== 'production',
})

// biome-ignore lint/suspicious/noConsole: this is ok
console.log(`🚀 Server running at ${server.url}`)
