import {eq} from 'drizzle-orm'
import {createMiddleware} from 'hono/factory'

import {getDatabase} from './sqlite/db'
import {usersTable} from './sqlite/schema'

/**
 * This middleware requires the cron job's email and password to continue.
 * The payload will contain email, password, and any other data relevant to the
 * particular endpoint it's hitting.
 */
export const cronOnlyMiddleware = createMiddleware(async (c, next) => {
  const failedResponse = new Response(
    JSON.stringify({nothing: 'to see here...'}),
    {
      status: 403,
      headers: {
        'Content-Type': 'application/json',
      },
    }
  )

  try {
    const {email, password, ...data}: {email: string; password: string} =
      await c.req.json()

    /**
     * Since the body of a request can only be read once, we store the rest of
     * the data on the context object for the route handler to retrieve.
     *
     * See `type Variables` in `server.ts`.
     */
    c.set(c.req.path, data)

    if (!email || email !== Bun.env.EMAIL) {
      throw new Error('Nope')
    }

    // TODO - manually add this user to the database.
    const [user] = await getDatabase()
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, email))
      .limit(1)

    // `user` is potentially undefined even though TS doesn't recognize that.
    const hash = user?.password ?? ''
    const verify = Bun.password.verifySync(password, hash)

    if (verify) {
      await next()
    } else {
      c.res = failedResponse
    }
  } catch (e) {
    if (Bun.env.NODE_ENV !== 'production') {
      // biome-ignore lint/suspicious/noConsole: this only runs in dev
      console.log('cronOnlyMiddleware failure:', e)
    }

    c.res = failedResponse
  }
})
