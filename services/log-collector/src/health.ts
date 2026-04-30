import type { Context, Hono } from 'hono'

/** Healthcheck reply payload returned by the `/health` route. */
export type HealthBody = {
  readonly status: 'ok'
  readonly version: string
  readonly at: number
}

/**
 * Wire the `/health` route on the supplied Hono instance. Reads
 * the build-time `VERSION` var so deploys can ship a known
 * identifier without rebuilding the route.
 * @param app Hono app to extend.
 * @returns Same Hono app for chaining.
 */
export const registerHealthRoute = (
  app: Hono<{ Bindings: { VERSION: string } }>
): Hono<{ Bindings: { VERSION: string } }> => {
  app.get('/health', (c: Context<{ Bindings: { VERSION: string } }>) => {
    const body: HealthBody = {
      status: 'ok',
      version: c.env.VERSION,
      at: Date.now(),
    }
    return c.json(body)
  })
  return app
}
