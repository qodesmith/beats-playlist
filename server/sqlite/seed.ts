import type {Video} from '@qodestack/dl-yt-playlist'

import {unlinkSync} from 'node:fs'
import path from 'node:path'

import {$} from 'bun'

import {getDatabase} from './db'
import * as tables from './schema'
const {
  beatsTable,
  usersTable,
  playlistsBeatsTable,
  playlistsTable,
  lyricsBeatsTable,
  lyricsTable,
} = tables

/**
 * Run this file:
 * bun --env-file=<path> seed.ts
 */

// Delete the database.
unlinkSync('./beats-playlist.dev.sqlite')

// Create the database.
await $`npx drizzle-kit push`

// Create the database.
const db = getDatabase()

///////////
// BEATS //
///////////

const metadataPath = path.resolve(
  import.meta.dirname,
  '../../public/beats/metadata.json'
)
const beatsData: Video[] = await Bun.file(metadataPath).json()
await db.insert(beatsTable).values(beatsData)

///////////
// USERS //
///////////

const admin: typeof usersTable.$inferInsert = {
  email: 'admin@example.com',
  password: 'password',
  isAdmin: true,
  avatarColor: '#f6df1d',
}
const larry: typeof usersTable.$inferInsert = {
  email: 'user@example.com',
  password: 'password',
  avatarColor: 'cornflowerblue',
}

const [{id: adminId}, {id: larryId}] = await db
  .insert(usersTable)
  .values([admin, larry])
  .returning()

///////////////
// PLAYLISTS //
///////////////

const playlist1: typeof playlistsTable.$inferInsert = {
  userId: adminId,
  name: 'Dope Beats',
}
const playlist2: typeof playlistsTable.$inferInsert = {
  userId: adminId,
  name: 'Deep Thoughts',
}
const playlist3: typeof playlistsTable.$inferInsert = {
  userId: larryId,
  name: 'Melancholy',
}

const [{id: playlistId1}, {id: playlistId2}, {id: playlistId3}] = await db
  .insert(playlistsTable)
  .values([playlist1, playlist2, playlist3])
  .returning()

await db.insert(playlistsBeatsTable).values([
  {playlistId: playlistId1, beatId: 'test'},
  {playlistId: playlistId1, beatId: 'rOFR5DhEzXs'},
  {playlistId: playlistId1, beatId: '_p2HEeQ1BCY'},

  {playlistId: playlistId2, beatId: 'mqapDwCk99E'},
  {playlistId: playlistId2, beatId: 'GgLcSFYowC4'},
  {playlistId: playlistId2, beatId: 'test'},
  {playlistId: playlistId2, beatId: 'tNFJVdKtd0w'},

  {playlistId: playlistId3, beatId: 'ConyWYvU2-A'},
  {playlistId: playlistId3, beatId: 'rjlNHOBYs6A'},
])

////////////
// LYRICS //
////////////

const adminLyrics1: typeof lyricsTable.$inferInsert = {
  userId: adminId,
  title: 'Dope Song',
  content: 'line 1\nline2',
}
const adminLyrics2: typeof lyricsTable.$inferInsert = {
  userId: adminId,
  title: 'What Is Life',
  content: 'line 1\nline2',
}
const larryLyrics: typeof lyricsTable.$inferInsert = {
  userId: larryId,
  title: 'Larry Rulez',
  content: 'line 1\nline2',
}

const [{id: adminLyric1Id}, {id: adminLyric2Id}, {id: larryLyricId}] = await db
  .insert(lyricsTable)
  .values([adminLyrics1, adminLyrics2, larryLyrics])
  .returning()

await db.insert(lyricsBeatsTable).values([
  {lyricId: adminLyric1Id, beatId: 'test'},
  {lyricId: adminLyric1Id, beatId: '_p2HEeQ1BCY'},
  {lyricId: adminLyric1Id, beatId: 'ConyWYvU2-A'},

  {lyricId: adminLyric2Id, beatId: 'test'},
  {lyricId: adminLyric2Id, beatId: 'GgLcSFYowC4'},

  {lyricId: larryLyricId, beatId: 'mqapDwCk99E'},
])