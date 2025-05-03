import path from 'node:path'
import process from 'node:process'

import {defineConfig} from 'drizzle-kit'

import {getEnvVar} from '../getEnvVar'

/**
 * DO NOT use `import.meta` in this file. The underlying Drizzle code that
 * consumes this config is cjs and doesn't work with `import.meta`.
 */

const SQLITE_DB_NAME = getEnvVar('SQLITE_DB_NAME')
const dbPath =
  process.env.NODE_ENV === 'production'
    ? `file:/beats/${SQLITE_DB_NAME}`
    : `file:${path.resolve(__dirname, SQLITE_DB_NAME)}`

// biome-ignore lint/style/noDefaultExport: drizzle expects a default export
export default defineConfig({
  out: path.resolve(__dirname, './drizzle'),
  schema: path.resolve(__dirname, './schema.ts'),
  dialect: 'sqlite',
  dbCredentials: {url: dbPath},
})
