import type {Video} from '@qodestack/dl-yt-playlist'

import {serverTiming} from '@elysiajs/server-timing'
import {Elysia} from 'elysia'

const SERVER_PORT = Bun.env.SERVER_PORT
const MAX_DURATION_SECONDS = Number(Bun.env.MAX_DURATION_SECONDS) || 60 * 8

if (SERVER_PORT === undefined) {
  throw new Error('SERVER_PORT not defined')
}

const app = new Elysia()
  .use(serverTiming())
  // Frontend assets.
  .get('/', () => Bun.file('/app/index.html'))
  .get('/assets/:file', ({params: {file}}) => Bun.file(`/app/assets/${file}`))

  // API
  .get('/metadata', async (/*{query}*/) => {
    const metadata: Video[] = await Bun.file('/beats/metadata.json').json()

    // Filter out videos we don't have an mp3 file for or that are too long.
    const filteredVideos = metadata.filter(
      ({audioFileExtension, durationInSeconds}) => {
        return !!audioFileExtension && durationInSeconds <= MAX_DURATION_SECONDS
      }
    )

    return {metadata: filteredVideos}

    // Paginated version:
    // const page = Number(query.page) || 1
    // const limit = Number(query.limit) || 50
    // const startIndex = (page - 1) * limit
    // const endIndex = page * limit

    // const metadata: Video[] = await Bun.file('/beats/metadata.json').json()
    // const paginatedMetadata = metadata.slice(startIndex, endIndex)

    // return {
    //   page,
    //   limit,
    //   total: metadata.length,
    //   data: paginatedMetadata,
    // }
  })
  .get('/thumbnails-small/:id', ({params: {id}}) =>
    Bun.file(`/beats/thumbnails/${id}[small].jpg`)
  )
  .get('/thumbnails/:id', ({params: {id}}) =>
    Bun.file(`/beats/thumbnails/${id}.jpg`)
  )
  .get('/beats/:id', ({params: {id}}) => Bun.file(`/beats/audio/${id}.mp3`))
  .listen(SERVER_PORT)

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
)
