import type {PluginOption} from 'vite'

import react from '@vitejs/plugin-react'
import dotenv from 'dotenv'
import {defineConfig} from 'vite'

dotenv.config()

const {NO_UNRAID} = process.env
const UNRAID_API = NO_UNRAID === 'true' ? undefined : process.env.UNRAID_API

// https://vitejs.dev/config/
export default defineConfig(({command}) => ({
  publicDir: command === 'build' ? false : 'public',
  plugins: [react(), rewriteUnraidApiPaths()],
  clearScreen: false,
  server: {
    open: true,
    proxy: UNRAID_API
      ? ['/beats', '/metadata', '/thumbnails'].reduce<Record<string, string>>(
          (acc, endpoint) => {
            acc[endpoint] = UNRAID_API
            return acc
          },
          {}
        )
      : undefined,
  },
}))

/**
 * When developing locally WITHOUT access to the Unraid server, rewrite paths
 * to reflect the file structure in the `public` directory.
 */
function rewriteUnraidApiPaths(): PluginOption {
  if (UNRAID_API) return null

  return {
    name: 'rewrite-unraid-api-paths',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const url = req.url ?? ''

        // Check if the URL matches the pattern /beats/:filename
        const beatsMatch = url.match(/^\/beats\/([^/]+)$/)

        if (beatsMatch) {
          // Rewrite the URL to /beats/audio/:filename
          req.url = `/beats/audio/${beatsMatch[1]}`
        } else if (url === '/metadata') {
          req.url = '/beats/metadata.json'
        }

        next()
      })
    },
  }
}
