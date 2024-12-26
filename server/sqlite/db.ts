import type {BunSQLiteDatabase} from 'drizzle-orm/bun-sqlite'

import path from 'node:path'

import {Database} from 'bun:sqlite'
import {drizzle} from 'drizzle-orm/bun-sqlite'

import * as schema from './schema'
import {getEnvVar} from '../getEnvVar'

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
    const SQLITE_DB_NAME = getEnvVar('SQLITE_DB_NAME')
    const dbPath = isProd
      ? `/beats/${SQLITE_DB_NAME}`
      : path.resolve(import.meta.dirname, SQLITE_DB_NAME)
    const sqlite = isTest ? getTestDb() : new Database(dbPath)

    db = drizzle({client: sqlite, schema})
  }

  return db
}

function getTestDb() {
  if (Bun.env.NODE_ENV !== 'test') {
    throw new Error('This function is only for use in tests')
  }

  const SQLITE_DB_NAME = getEnvVar('SQLITE_DB_NAME')
  const dbPath = path.resolve(import.meta.dirname, SQLITE_DB_NAME)

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
