import type {PluginOption} from 'vite'

import fs from 'node:fs'

import react from '@vitejs/plugin-react'
import dotenv from 'dotenv'
import {defineConfig} from 'vite'

dotenv.config()

const {NO_UNRAID} = process.env
const UNRAID_API = NO_UNRAID === 'true' ? undefined : process.env.UNRAID_API

// https://vitejs.dev/config/
export default defineConfig(({command}) => ({
  publicDir: command === 'build' ? false : 'public',
  plugins: [react(), localUnraidApiPaths(), copyPublicAssetsAfterBuild()],
  clearScreen: false,
  server: {
    open: true,
    proxy: UNRAID_API
      ? {
          '/beats': UNRAID_API,
          '/metadata': UNRAID_API,
          '/thumbnails': UNRAID_API,
        }
      : undefined,
  },
}))

/**
 * When developing locally WITHOUT access to the Unraid server, rewrite paths
 * to reflect the file structure in the `public` directory.
 */
function localUnraidApiPaths(): PluginOption {
  if (UNRAID_API) return null

  return {
    name: 'rewrite-unraid-api-paths',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (!req.url) return next()
        const url = new URL(req.url, `http://${req.headers.host}`)

        // Check if the URL matches the pattern /beats/:filename
        const beatsMatch = url.pathname.match(/^\/beats\/([^/]+)$/)

        if (beatsMatch) {
          // Rewrite the URL to /beats/audio/:filename
          req.url = `/beats/audio/${beatsMatch[1]}`
        } else if (url.pathname === '/metadata') {
          req.url = '/beats/metadata.json'

          // Mimic the server behavior for paginated metadata results.
          // const metadata: Video[] = JSON.parse(
          //   fs.readFileSync('./public/beats/metadata.json', {encoding: 'utf8'})
          // )

          // const page = Number(url.searchParams.get('page')) || 1
          // const limit = Number(url.searchParams.get('limit')) || 3
          // const startIndex = (page - 1) * limit
          // const endIndex = page * limit
          // const paginatedMetadata = metadata.slice(startIndex, endIndex)
          // const responseData = JSON.stringify({
          //   page,
          //   limit,
          //   total: metadata.length,
          //   data: paginatedMetadata,
          // })

          // res.writeHead(200, {'Content-Type': 'application/json'})
          // res.end(responseData)
        }

        next()
      })
    },
  }
}

/**
 * Since we're mimicing the unraid server with the `/public/beats` folder, we
 * don't want that copied over into the build. This plugin copies all files from
 * the `/public` folder root and ignores any sub-directories.
 */
function copyPublicAssetsAfterBuild(): PluginOption {
  return {
    name: 'copyPublicAssetsAfterBuild',
    closeBundle() {
      const items = fs.readdirSync('./public')
      const files = items.filter(item =>
        fs.statSync(`./public/${item}`).isFile()
      )

      files.forEach(file => {
        const publicPath = `./public/${file}`
        const distPath = `./dist/${file}`

        fs.copyFileSync(publicPath, distPath)
      })
    },
  }
}
