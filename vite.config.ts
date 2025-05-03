import type {PluginOption} from 'vite'

import fs from 'node:fs'
import process from 'node:process'

import react from '@vitejs/plugin-react'
import dotenv from 'dotenv'
import {defineConfig} from 'vite'
import mkcert from 'vite-plugin-mkcert'

dotenv.config({path: './.env'})
const {SERVER_PORT, USE_PROD_API, UNRAID_API = ''} = process.env

// https://vitejs.dev/config/
// biome-ignore lint/style/noDefaultExport: Vite expects a default export
export default defineConfig(({command, mode}) => ({
  publicDir: command === 'build' ? false : 'public',
  plugins: [
    react(),
    mkcert(),
    command === 'build' && copyPublicAssetsAfterBuild(),
  ],
  clearScreen: false,
  server: {
    open: true,
    host: '0.0.0.0',
    proxy: {
      '/api': USE_PROD_API ? UNRAID_API : `http://localhost:${SERVER_PORT}`,
    },
  },
  define: {
    // biome-ignore lint/style/useNamingConvention: this is ok
    __DEV__: command !== 'build' && mode !== 'production',
  },
}))

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
      const filesOnly = items.filter(item => {
        return (
          fs.statSync(`./public/${item}`).isFile() &&
          !excludedPublicSet.has(item)
        )
      })

      filesOnly.forEach(file => {
        const publicPath = `./public/${file}`
        const distPath = `./dist/${file}`

        fs.copyFileSync(publicPath, distPath)
      })
    },
  }
}

const excludedPublicSet = new Set([
  /**
   * Animated gif => webm:
   * ffmpeg -i input.gif -c vp9 -b:v 0 -crf 40 output.webm
   *
   * Reduce size of webm:
   * ffmpeg -i forbidden-original.webm -c:v libvpx-vp9 -crf 50 -b:v 0 -r 10 forbidden.webm
   */
  'forbidden.gif',
  'forbidden-original.webm',
])
