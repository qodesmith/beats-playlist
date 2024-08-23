import type {Elysia} from 'elysia'

import {gzipSync} from 'bun'
import compressible from 'compressible'
import {mapResponse} from 'elysia'

export function gzip(app: Elysia) {
  return app.onAfterHandle(async ({response, set}) => {
    const res = mapResponse(response, {status: 200, headers: {}})
    const contentType = res.headers.get('content-type') ?? 'text/plain'
    const isCompressible = compressible(contentType)

    if (!isCompressible) return

    set.headers['content-encoding'] = 'gzip'
    set.headers['content-type'] = contentType

    // Bun.file(...) returns a blob.
    if (response instanceof Blob) {
      set.headers['original-content-length'] = `${response.size}`
      const compressed = gzipSync(await response.arrayBuffer())
      return new Response(compressed)
    }

    const text =
      typeof response === 'object'
        ? JSON.stringify(response)
        : (response?.toString() ?? '')

    set.headers['original-content-length'] = `${text.length}`

    return new Response(gzipSync(text))
  })
}
