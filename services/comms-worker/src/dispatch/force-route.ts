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

const isGated = (c: Context): boolean =>
  (c.env as DispatchEnv).BYPASS_SCHEDULE === '1' &&
  c.req.query('force') === '1'

const buildHandler =
  (dispatcher: ForceDispatcher) =>
  async (c: Context): Promise<Response> => {
    if (!isGated(c)) return c.json({ error: 'not_found' }, 404)
    const summary = await dispatcher(c.env as DispatchEnv, new Date())
    return c.json(summary, 202)
  }

/**
 * Mount `POST /api/dispatch` — a session-gated manual tick
 * trigger guarded by `BYPASS_SCHEDULE=1` + `?force=1`. Exists in
 * prod (where `BYPASS_SCHEDULE` is unset) but always 404s there.
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
