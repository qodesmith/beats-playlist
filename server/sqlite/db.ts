import type {BunSQLiteDatabase} from 'drizzle-orm/bun-sqlite'

import {Database} from 'bun:sqlite'
import path from 'node:path'
import process from 'node:process'

import {drizzle} from 'drizzle-orm/bun-sqlite'

import {getEnvVar} from '../getEnvVar'
import * as schema from './schema'

let db: BunSQLiteDatabase<typeof schema> & {$client: Database}

export function getDatabase({fresh = false}: {fresh?: boolean} = {}) {
  const isProd = process.env.NODE_ENV === 'production'
  const isTest = process.env.NODE_ENV === 'test'

  if (fresh && isTest) {
    db?.$client.close()
    db = drizzle({client: getTestDb(), schema})

    return db
  }

  if (!db) {
    const SqliteDbName = getEnvVar('SQLITE_DB_NAME')
    const dbPath = isProd
      ? `/beats/${SqliteDbName}`
      : path.resolve(import.meta.dirname, SqliteDbName)
    const sqlite = isTest ? getTestDb() : new Database(dbPath)

    db = drizzle({client: sqlite, schema})
  }

  return db
}

function getTestDb() {
  if (Bun.env.NODE_ENV !== 'test') {
    throw new Error('This function is only for use in tests')
  }

  const SqliteDbName = getEnvVar('SQLITE_DB_NAME')
  const dbPath = path.resolve(import.meta.dirname, SqliteDbName)

  /**
   * https://bun.sh/docs/api/sqlite#serialize
   *
   * When testing, clone the existing database into memory. This enables
   * us to add and remove data in tests without worry.
   */
  const existingDbOnDisk = new Database(dbPath)
  const contents = existingDbOnDisk.serialize()

  // @ts-expect-error this is how the docs say to do it.
  return Database.deserialize(contents)
}
