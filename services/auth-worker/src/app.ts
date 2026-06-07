import { Hono } from 'hono'
import type { WorkerCtx } from './bindings'
import { cors } from './cors'
import { registerHealthRoute } from './health'
import { registerLogoutRoute } from './logout-handler'
import { registerSessionRoute } from './session-handler'

/**
 * Build the auth-worker Hono app. CORS is applied to every route
 * so preflight responses include the right allow-credentials
 * headers. Tests instantiate this directly without the worker env.
 * @returns Hono app ready for `fetch`.
 */
export const createApp = (): Hono<WorkerCtx> => {
  const app = new Hono<WorkerCtx>()
  app.use('*', async (c, next) => {
    const mw = cors({ allowedOrigin: c.env.ALLOWED_ORIGIN })
    return mw(c, next)
  })
  registerHealthRoute(app)
  registerSessionRoute(app)
  registerLogoutRoute(app)
  return app
}
