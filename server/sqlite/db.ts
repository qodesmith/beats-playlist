import type {BunSQLiteDatabase} from 'drizzle-orm/bun-sqlite'

import path from 'node:path'

import {Database} from 'bun:sqlite'
import {drizzle} from 'drizzle-orm/bun-sqlite'

import * as schema from './schema'
import {getEnvVar} from '../getEnvVar'

let db: BunSQLiteDatabase<typeof schema> & {$client: Database}

export function getDatabase() {
  if (!db) {
    const SQLITE_DB_NAME = getEnvVar('SQLITE_DB_NAME')
    const isProd = process.env.NODE_ENV === 'production'
    const dbPath = isProd
      ? `/beats/${SQLITE_DB_NAME}`
      : path.resolve(import.meta.dirname, SQLITE_DB_NAME)
    const sqlite = new Database(dbPath, {create: true})
    db = drizzle({client: sqlite, schema})
  }

  return db
}
