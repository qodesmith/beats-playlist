/**
 * THIS FILE IS ONLY MEANT TO BE RUN ONCE!!!
 * This will migrate the data in metadata.json to the SQLite database.
 */

import type {Video} from '@qodestack/dl-yt-playlist'

import {$} from 'bun'

import {getDatabase} from './sqlite/db'
import {beatsTable} from './sqlite/schema'

await $`bunx drizzle-kit push --config="/app/sqlite/drizzle.config.ts"`

const db = getDatabase()
const metadata: Video[] = await Bun.file('/beats/metadata.json').json()

await db.insert(beatsTable).values(metadata)
