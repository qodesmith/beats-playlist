import path from 'node:path'

import {defineConfig} from 'drizzle-kit'

import {getEnvVar} from '../getEnvVar'

const SQLITE_DB_NAME = getEnvVar('SQLITE_DB_NAME')

/**
 * DO NOT use `import.meta` in this file. The underlying Drizzle code that
 * consumes this config is cjs and doesn't work with `import.meta`.
 */
export default defineConfig({
  out: path.resolve(__dirname, './drizzle'),
  schema: path.resolve(__dirname, './schema.ts'),
  dialect: 'sqlite',
  dbCredentials: {url: `file:${path.resolve(__dirname, SQLITE_DB_NAME)}`},
})
