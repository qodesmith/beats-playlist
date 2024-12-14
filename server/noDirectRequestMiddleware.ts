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
    // 640 x 342
    const html = `
      <body style="height:100%;background:#000;display:grid;place-items:center;margin:0;">
        <video autoplay muted loop style="max-width:640px;width:100%;">
          <source src="/forbidden.webm" type="video/webm">
          Please don't link directly to these assets.
        </video>
      </body>
    `
    c.res = new Response(html, {
      status: 200,
      headers: {'Content-Type': 'text/html'},
    })
  } else {
    await next()
  }
})
