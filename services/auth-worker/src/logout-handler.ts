import type { Hono } from 'hono'
import type { WorkerCtx } from './bindings'
import { buildLogoutCookie } from './cookie'

/**
 * Mount `POST /auth/logout`. Sends a `Set-Cookie` that immediately
 * invalidates the session cookie on the client. Always 200 — there
 * is no auth check; clearing a cookie has no side effect on anyone
 * but the caller, so checking the bearer is pointless.
 * @param app Hono app to extend.
 * @returns Same app for chaining.
 */
export const registerLogoutRoute = (
  app: Hono<WorkerCtx>
): Hono<WorkerCtx> => {
  app.post('/auth/logout', c =>
    c.json({ ok: true }, 200, {
      'Set-Cookie': buildLogoutCookie(c.env.COOKIE_DOMAIN),
    })
  )
  return app
}
