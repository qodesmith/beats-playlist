import {Elysia} from 'elysia'

const port = Bun.env.SERVER_PORT
if (port === undefined) {
  throw new Error('SERVER_PORT not defined')
}

const app = new Elysia()
  .get('/', () => Bun.file('/app/index.html'))
  .get('/assets/:file', ({params: {file}}) => Bun.file(`/app/assets/${file}`))
  .get('/metadata', () => Bun.file('/beats/metadata.json'))
  .get('/thumbnails/:id', ({params: {id}}) =>
    Bun.file(`/beats/thumbnails/${id}.jpg`)
  )
  .get('/beats/:file', ({params: {file}}) => Bun.file(`/beats/audio/${file}`))
  .listen(port)

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
)
