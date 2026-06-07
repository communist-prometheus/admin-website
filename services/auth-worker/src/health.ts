import type { Hono } from 'hono'
import type { WorkerCtx } from './bindings'

/**
 * Mount the public `GET /health` route. Unauthenticated by design so
 * uptime monitors don't need a token.
 * @param app Hono app to extend.
 * @returns Same app for chaining.
 */
export const registerHealthRoute = (
  app: Hono<WorkerCtx>
): Hono<WorkerCtx> => {
  app.get('/health', c =>
    c.json({ status: 'ok', version: c.env.VERSION, at: Date.now() })
  )
  return app
}
