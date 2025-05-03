/** biome-ignore-all lint/suspicious/noConsole: this is ok */
import {desc} from 'drizzle-orm'

import {getDatabase} from './db'
import {beatsTable} from './schema'

/**
 * Duplicate the thumbnails.
 */

// const thumbnailPath = path.resolve(
//   import.meta.dirname,
//   '../../public/beats/thumbnails'
// )
// const thumbnailNames = fs.readdirSync(thumbnailPath).filter(item => {
//   return item.endsWith('.jpg')
// })
// for (const name of thumbnailNames) {
//   const file = await Bun.file(path.resolve(thumbnailPath, name))
//   const filePath2 = path.resolve(thumbnailPath, `2-${name}`)
//   const filePath3 = path.resolve(thumbnailPath, `3-${name}`)
//   await Bun.write(filePath2, file)
//   await Bun.write(filePath3, file)
// }

/**
 * Duplicate the audio files.
 */

// const audioPath = path.resolve(import.meta.dirname, '../../public/beats/audio')
// const audioFileNames = fs.readdirSync(audioPath).filter(item => {
//   return item.endsWith('.mp3') && !item.startsWith('unknown.mp3')
// })
// for (const name of audioFileNames) {
// const mp3File = await Bun.file(path.resolve(audioPath, name))
// const filePath2 = path.resolve(audioPath, `2-${name}`)
// const filePath3 = path.resolve(audioPath, `3-${name}`)
// await Bun.write(filePath2, mp3File)
// await Bun.write(filePath3, mp3File)
// }

/**
 * Add metadata for all the duplicates.
 * Ensure descending dates for `dateAddedToPlaylist`.
 * Ensure the `id` matches the file name.
 */

const db = getDatabase()
const metadata = await db
  .select()
  .from(beatsTable)
  .orderBy(desc(beatsTable.dateAddedToPlaylist))
// const earliestDate = '2024-07-01T23:09:39Z'

let month = 5
let day = 25
const newMetadata = metadata
  .map(v => ({
    ...v,
    id: `2-${v.id}`,
    title: `(2) ${v.title}`,
    dateAddedToPlaylist: new Date(2024, month--, day--).toISOString(),
  }))
  .concat(
    metadata.map(v => ({
      ...v,
      id: `3-${v.id}`,
      title: `(3) ${v.title}`,
      dateAddedToPlaylist: new Date(2024, month--, day--).toISOString(),
    }))
  )

/**
 * Write thhe metadata for the duplicates to the database.
 * Now the UI has enough entries to test the virtual grid.
 */
const res = await db.insert(beatsTable).values(newMetadata).returning()
console.log(res)

// await Bun.write(
//   `${import.meta.dirname}/newMetadata.json`,
//   JSON.stringify(newMetadata, null, 2)
// )
