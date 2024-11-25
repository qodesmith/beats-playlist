import {sql} from 'drizzle-orm'
import {
  sqliteTable,
  integer,
  real,
  text,
  primaryKey,
} from 'drizzle-orm/sqlite-core'

/*
  https://orm.drizzle.team/docs/column-types/sqlite
  https://bun.sh/docs/api/sqlite#datatypes

  | JavaScript type | SQLite type        |
  |-----------------|--------------------|
  | string          | TEXT               |
  | number          | INTEGER or DECIMAL |
  | boolean         | INTEGER (1 or 0)   |
  | Uint8Array      | BLOB               |
  | Buffer          | BLOB               |
  | bigint          | INTEGER            |
  | null            | NULL               |

  You can run `npx drizzle-kit push` to generate a database. To generate
  migration data, use the 2 commands below.

  When making changes to the database in dev, run these two commands:
  1. npx drizzle-kit generate - generates a drizzle folder with json metadata
  2. npx drizzle-kit migrate - generates the database with tables
  👆 These two commands should be run inside the server/sqlite directory

  https://orm.drizzle.team/drizzle-studio/overview
  Start drizzle studio, a visual way to see your database:
  - Navigate to the server/sqlite directory
  - npx drizzle-kit studio
  - Visit https://local.drizzle.studio
  - Turn Brave Shields off to see the site
*/

export const usersTable = sqliteTable('users', {
  id: integer().primaryKey({autoIncrement: true}),
  email: text().notNull().unique(),
  password: text().notNull(),
  isAdmin: integer({mode: 'boolean'}).default(false).notNull(),
  avatarUrl: text(),
  avatarColor: text(),
  createdAt: integer({mode: 'timestamp_ms'})
    .notNull()
    .default(sql`(unixepoch() * 1000)`),
})

export const playlistsTable = sqliteTable('playlists', {
  id: integer().primaryKey({autoIncrement: true}),
  name: text().notNull(),
  createdAt: integer({mode: 'timestamp_ms'})
    .notNull()
    .default(sql`(unixepoch() * 1000)`),
  userId: integer()
    // When the user is deleted, delete this playlist.
    .references(() => usersTable.id, {onDelete: 'cascade'})
    .notNull(),
})

export const beatsTable = sqliteTable('beats', {
  id: text().primaryKey().notNull(),
  playlistItemId: text().notNull(),
  title: text().notNull(),
  description: text().notNull(),
  channelId: text().notNull(),
  channelName: text().notNull(),
  dateCreated: text().notNull(),
  dateAddedToPlaylist: text().notNull(),
  thumbnailUrls: text({mode: 'json'}).$type<string[]>().default([]).notNull(),
  durationInSeconds: integer().notNull(),
  url: text().notNull(),
  channelUrl: text(),
  audioFileExtension: text(),
  videoFileExtension: text(),
  isUnavailable: integer({mode: 'boolean'}).notNull(),
  lufs: real(), // Float.
})

export const playlistsBeatsTable = sqliteTable(
  'playlists_beats',
  {
    playlistId: integer()
      // When the playlist is deleted, delete this row.
      .references(() => playlistsTable.id, {onDelete: 'cascade'})
      .notNull(),
    beatId: text()
      // When the beat is deleted, delete this row.
      .references(() => beatsTable.id, {onDelete: 'cascade'})
      .notNull(),
  },
  table => ({
    pk: primaryKey({columns: [table.playlistId, table.beatId]}),
  })
)

export const lyricsTable = sqliteTable('lyrics', {
  id: integer().primaryKey({autoIncrement: true}),
  title: text().notNull(),
  content: text().notNull(),
  createdAt: integer({mode: 'timestamp_ms'})
    .notNull()
    .default(sql`(unixepoch() * 1000)`),
  userId: integer()
    .references(() => usersTable.id, {onDelete: 'cascade'})
    .notNull(),
})

export const lyricsBeatsTable = sqliteTable(
  'lyrics_beats',
  {
    lyricId: integer()
      // When the lyric is deleted, delete this row.
      .references(() => playlistsTable.id, {onDelete: 'cascade'})
      .notNull(),
    beatId: text()
      // When the beat is deleted, delete this row.
      .references(() => beatsTable.id, {onDelete: 'cascade'})
      .notNull(),
  },
  table => ({
    pk: primaryKey({columns: [table.lyricId, table.beatId]}),
  })
)

export const sessionsTable = sqliteTable('sessions', {
  id: integer().primaryKey({autoIncrement: true}),
  createdAt: integer({mode: 'timestamp_ms'})
    .notNull()
    .default(sql`(unixepoch() * 1000)`),
  userId: integer()
    .references(() => usersTable.id, {onDelete: 'cascade'})
    .notNull()
    .unique(), // There can only be one session per user.
})
