/**
 * THIS FILE IS ONLY MEANT TO BE RUN ONCE!!!
 * This will migrate the data in metadata.json to the SQLite database.
 */

import {Video} from '@qodestack/dl-yt-playlist'
import {$} from 'bun'
import {getDatabase} from './sqlite/db'
import {beatsTable} from './sqlite/schema'
import {getEnvVar} from './getEnvVar'

const configPath = `/app/sqlite/drizzle.config.ts`
const SQLITE_DB_NAME = getEnvVar('SQLITE_DB_NAME')
const dbPath = `/app/sqlite/${SQLITE_DB_NAME}`

if (Bun.file(dbPath).size !== 0) {
  throw new Error(`Refusing to proceed. ${SQLITE_DB_NAME} already exists.`)
}

const metadata: Video[] = await Bun.file('/beats/metadata.json').json()

await $`bunx drizzle-kit push --config="${configPath}"`

const db = getDatabase()

await db.insert(beatsTable).values(metadata)
