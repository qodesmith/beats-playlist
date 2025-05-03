import {gzipSync} from 'bun'

import compressible from 'compressible'
import {createMiddleware} from 'hono/factory'

const MIN_COMPRESS_SIZE = 1024

// TODO: use hono/compress once Bun implements CompressionStream
// https://github.com/oven-sh/bun/issues/1723
export const gzip = createMiddleware(async (c, next) => {
  await next()

  const contentType = c.res.headers.get('content-type') ?? 'text/plain'
  const isCompressible = compressible(contentType)

  if (
    c.res.headers.has('content-encoding') || // Already compressed
    c.req.method === 'HEAD' || // Don't compress HEAD requests
    !isCompressible || // Not compressible
    c.res.status === 204 || // No content
    (c.res.status >= 300 && c.res.status < 400) || // Redirect
    !c.req.header('accept-encoding')?.includes('gzip') // Client doesn't accept gzip
  ) {
    return
  }

  const arrayBuffer = await c.res.arrayBuffer()

  // Trying to compress small responses can actually increase the size due to
  // the overhead of compression.
  if (arrayBuffer.byteLength < MIN_COMPRESS_SIZE) {
    // Must set a new response since the arrayBuffer has already been read.
    c.res = new Response(arrayBuffer, {
      status: c.res.status,
      headers: c.res.headers,
    })

    return
  }

  const compressed = gzipSync(arrayBuffer)

  c.res.headers.set('content-encoding', 'gzip')
  c.res.headers.set('content-type', contentType)
  c.res.headers.set('original-content-length', `${arrayBuffer.byteLength}`)
  c.res.headers.set('content-length', `${compressed.byteLength}`)
  c.res = new Response(compressed, {
    status: c.res.status,
    headers: c.res.headers,
  })
})
