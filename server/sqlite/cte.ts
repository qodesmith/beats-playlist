/** biome-ignore-all lint/correctness/noUnusedVariables: this is ok */
/** biome-ignore-all lint/suspicious/noConsole: this is ok */

import {desc, getTableColumns, sql} from 'drizzle-orm'

import {getDatabase} from './db'
import {beatsTable} from './schema'

const db = getDatabase()

const _isoDate = '2024-07-16T21:56:16Z'

const {description, thumbnailUrls, ...tableCols} = getTableColumns(beatsTable)

const sq = db.$with('sq').as(
  db
    .select({
      index: sql`ROW_NUMBER() OVER (ORDER BY dateAddedToPlaylist desc)

        `.as('index'),
      dateAddedToPlaylist: beatsTable.dateAddedToPlaylist,
      id: beatsTable.id,
      // ...tableCols,
    })
    .from(beatsTable)
    .orderBy(desc(beatsTable.dateAddedToPlaylist))
)
const result = await db.with(sq).select().from(sq)
// .orderBy(desc(sq.dateAddedToPlaylist))

console.log('RESULT:', result)

// CTE - common table expression - https://orm.drizzle.team/docs/select#with-clause
const _rawQuery = sql`
  WITH temp AS (
    SELECT *, ROW_NUMBER() OVER (ORDER BY dateAddedToPlaylist DESC) AS row_index
    FROM BEATS
  )
  SELECT id, dateAddedToPlaylist, row_index
  FROM temp
  WHERE dateAddedToPlaylist < "2024-07-16T21:56:16Z"
    AND durationInSeconds < 900
    AND audioFileExtension IS NOT NULL
`
