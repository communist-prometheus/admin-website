import type { Context, Hono } from 'hono'
import type { Bindings } from '../bindings'
import { listRecentWithEmail } from './with-email'

type App = Hono<{ Bindings: object; Variables: object }>

const DEFAULT_LIMIT = 20
const MAX_LIMIT = 100

const parseLimit = (raw: string | undefined): number => {
  if (raw === undefined) return DEFAULT_LIMIT
  const n = Number(raw)
  if (!Number.isInteger(n) || n <= 0) return DEFAULT_LIMIT
  return Math.min(n, MAX_LIMIT)
}

const handle = async (c: Context): Promise<Response> => {
  const limit = parseLimit(c.req.query('limit'))
  const runs = await listRecentWithEmail((c.env as Bindings).DB, limit)
  return c.json({ runs })
}

/**
 * Mount `GET /api/runs?limit=N` — returns the `N` most-recent
 * send_log rows joined with the subscriber email (R5.1). The route
 * sits behind the `/api/*` `requireSession` middleware mounted in
 * `app.ts`, so callers must present a valid SSO session cookie.
 * @param app Hono app, already wrapped with `requireSession` for /api/*.
 * @returns The same app for chaining.
 */
export const mountRunsRoute = (app: App): App => {
  app.get('/api/runs', handle)
  return app
}
