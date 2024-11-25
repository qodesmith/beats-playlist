import type {BunSQLiteDatabase} from 'drizzle-orm/bun-sqlite'

import path from 'node:path'

import {Database} from 'bun:sqlite'
import {drizzle} from 'drizzle-orm/bun-sqlite'

import * as schema from './schema'

let db: BunSQLiteDatabase<typeof schema> & {$client: Database}

export function getDatabase() {
  if (!db) {
    const dbPath = path.resolve(
      import.meta.dirname,
      process.env.SQLITE_DB_NAME!
    )
    const sqlite = new Database(dbPath, {create: true})
    db = drizzle({client: sqlite, schema})
  }

  return db
}
