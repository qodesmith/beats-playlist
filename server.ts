import {serverTiming} from '@elysiajs/server-timing'
import {Elysia} from 'elysia'

const port = Bun.env.SERVER_PORT
if (port === undefined) {
  throw new Error('SERVER_PORT not defined')
}

const app = new Elysia()
  .use(serverTiming())
  // Frontend assets.
  .get('/', () => Bun.file('/app/index.html'))
  .get('/assets/:file', ({params: {file}}) => Bun.file(`/app/assets/${file}`))

  // API
  .get('/metadata', async (/*{query}*/) => {
    return Bun.file('/beats/metadata.json')

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
  .get('/thumbnails/:id', ({params: {id}}) =>
    Bun.file(`/beats/thumbnails/${id}.jpg`)
  )
  .get('/beats/:file', ({params: {file}}) =>
    Bun.file(`/beats/audio/${decodeURIComponent(file)}`)
  )
  .listen(port)

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
)
