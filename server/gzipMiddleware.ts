import type {Context, Next} from 'hono'

import {gzipSync} from 'bun'
import compressible from 'compressible'

// TODO: use hono/compress once Bun implemented CompressionStream
// https://github.com/oven-sh/bun/issues/1723
export async function gzip(c: Context, next: Next) {
  await next()

  const contentType = c.res.headers.get('content-type') ?? 'text/plain'
  const isCompressible = compressible(contentType)
  const {body} = c.res

  if (
    c.res.headers.has('content-encoding') || // Already compressed
    c.req.method === 'HEAD' || // Don't compress HEAD requests
    !isCompressible // Not compressible
  ) {
    return
  }

  c.res.headers.set('content-encoding', 'gzip')
  c.res.headers.set('content-type', contentType)

  // Bun.file(...) returns a blob.
  if (body instanceof Blob) {
    c.res.headers.set('original-content-length', `${body.size}`)
    const compressed = gzipSync(await body.arrayBuffer())
    return new Response(compressed)
  }

  const text =
    typeof body === 'object' ? JSON.stringify(body) : (body?.toString() ?? '')

  c.res.headers.set('original-content-length', `${text.length}`)

  return new Response(gzipSync(text))
}
