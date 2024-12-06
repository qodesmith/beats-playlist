import {safeJsonParse} from '@qodestack/utils'
import {createMiddleware} from 'hono/factory'

export const noDirectRequestMiddleware = createMiddleware(async (c, next) => {
  const forbiddenHeaders = safeJsonParse<[string, string][]>(
    process.env.FORBIDDEN_HEADERS ?? '',
    []
  )
  const isForbidden = forbiddenHeaders.some(([header, value]) => {
    return c.req.header(header) === value
  })

  if (isForbidden) {
    c.res = new Response('Swing and a miss...', {
      status: 403,
      headers: {
        'Content-Type': 'application/json',
      },
    })
  } else {
    await next()
  }
})
