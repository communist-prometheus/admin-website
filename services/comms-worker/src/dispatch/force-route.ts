import type { Context, Hono } from 'hono'
import { buildRuntimeDeps } from './build-deps'
import { runDispatch } from './run'
import type { DispatchEnv } from './runtime-env'
import type { DispatchSummary } from './types'

type App = Hono<{ Bindings: object; Variables: object }>

/** Test-time dispatcher seam (mirrors {@link Dispatcher} in scheduled.ts). */
export type ForceDispatcher = (
  env: DispatchEnv,
  tickAt: Date
) => Promise<DispatchSummary>

const defaultDispatcher: ForceDispatcher = (env, tickAt) =>
  runDispatch(buildRuntimeDeps(env, tickAt))

const isOptedIn = (c: Context): boolean => c.req.query('force') === '1'

const buildHandler =
  (dispatcher: ForceDispatcher) =>
  async (c: Context): Promise<Response> => {
    if (!isOptedIn(c)) return c.json({ error: 'not_found' }, 404)
    const summary = await dispatcher(c.env as DispatchEnv, new Date())
    return c.json(summary, 202)
  }

/**
 * Mount `POST /api/dispatch?force=1` — owner-only manual tick
 * trigger. The route is gated by the session middleware
 * (owner-only) and by the `?force=1` query string so an accidental
 * GET or omitted query returns 404 instead of firing. Always
 * leaves `settings.schedule` untouched; the saved cron continues
 * to fire on its own cadence after a manual tick.
 * @param app Hono app, already wrapped with `requireSession`.
 * @param opts Optional dispatcher seam for unit tests.
 * @returns The same app for chaining.
 */
export const mountForceDispatchRoute = (
  app: App,
  opts: { readonly dispatcher?: ForceDispatcher } = {}
): App => {
  app.post(
    '/api/dispatch',
    buildHandler(opts.dispatcher ?? defaultDispatcher)
  )
  return app
}
