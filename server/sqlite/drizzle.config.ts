import dotenv from 'dotenv'
import {defineConfig} from 'drizzle-kit'

dotenv.config({path: '../../.env'})
const {SQLITE_DB_NAME} = process.env

if (!SQLITE_DB_NAME) {
  throw new Error('No value for SQLITE_DB_NAME env var found.')
}

export default defineConfig({
  out: './drizzle',
  schema: './schema.ts',
  dialect: 'sqlite',
  dbCredentials: {url: SQLITE_DB_NAME!},
})
