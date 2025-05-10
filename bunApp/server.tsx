import {gzipSync, serve} from 'bun'
import process from 'node:process'

import {getRandomNumber} from '@qodestack/utils'

import index from './index.html'

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
  },

  development: process.env.NODE_ENV !== 'production',
})

// biome-ignore lint/suspicious/noConsole: this is ok
console.log(`🚀 Server running at ${server.url}`)
