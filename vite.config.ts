import type {PluginOption} from 'vite'

import fs from 'node:fs'

import react from '@vitejs/plugin-react'
import dotenv from 'dotenv'
import {defineConfig} from 'vite'
import mkcert from 'vite-plugin-mkcert'

dotenv.config({path: './.env'})
const {SERVER_PORT, USE_PROD_API, UNRAID_API = ''} = process.env

// https://vitejs.dev/config/
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
