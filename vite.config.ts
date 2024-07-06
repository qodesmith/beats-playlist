import react from '@vitejs/plugin-react'
import dotenv from 'dotenv'
import {defineConfig} from 'vite'

dotenv.config()

const {UNRAID_API} = process.env

// https://vitejs.dev/config/
export default defineConfig(({command}) => ({
  publicDir: command === 'build' ? false : 'public',
  plugins: [react()],
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
