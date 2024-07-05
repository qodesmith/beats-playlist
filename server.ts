import {Elysia} from 'elysia'

const port = Bun.env.SERVER_PORT
if (port === undefined) {
  throw new Error('SERVER_PORT not defined')
}

const app = new Elysia()
  .get('/metadata', () => Bun.file('metadata.json'))
  .get('/thumbnails/:id', ({params: {id}}) => Bun.file(`/thumbnails/${id}.jpg`))
  .get('/beats/:file', ({params: {file}}) => Bun.file(`/audio/${file}`))
  .listen(port)

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
)
