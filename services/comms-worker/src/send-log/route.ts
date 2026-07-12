import type { Context, Hono } from 'hono'
import type { Bindings } from '../bindings'
import { listForSubscriber } from './by-subscriber'
import { listRecentWithEmail } from './with-email'

type App = Hono<{ Bindings: object; Variables: object }>

/*
 * The old default of 20 (hard-capped at 100) is why the log looked
 * almost empty: one tick writes one row per recipient, so a single run
 * to 124 subscribers already buries every earlier run behind the cap.
 * The page now asks for a real page of rows and can walk back further.
 */
const DEFAULT_LIMIT = 200
const MAX_LIMIT = 1_000

const parsePositive = (raw: string | undefined, fallback: number): number => {
  if (raw === undefined) return fallback
  const n = Number(raw)
  return Number.isInteger(n) && n >= 0 ? n : fallback
}

const parseLimit = (raw: string | undefined): number => {
  const n = parsePositive(raw, DEFAULT_LIMIT)
  return n === 0 ? DEFAULT_LIMIT : Math.min(n, MAX_LIMIT)
}

const handle = async (c: Context): Promise<Response> => {
  const limit = parseLimit(c.req.query('limit'))
  const offset = parsePositive(c.req.query('offset'), 0)
  const runs = await listRecentWithEmail(
    (c.env as Bindings).DB,
    limit,
    offset
  )
  return c.json({ runs })
}

const handleForSubscriber = async (c: Context): Promise<Response> => {
  const id = Number(c.req.param('id'))
  if (!Number.isInteger(id) || id <= 0)
    return c.json({ error: 'bad id' }, 400)
  const runs = await listForSubscriber((c.env as Bindings).DB, id)
  return c.json({ runs })
}

/**
 * Mount the send-log routes:
 * - `GET /api/runs?limit=N&offset=M` — a page of send_log rows joined
 *   with the subscriber email, newest first (R5.1).
 * - `GET /api/subscribers/:id/runs` — the full send history of one
 *   address, so the editor can see what that recipient actually got.
 *
 * Both sit behind the `/api/*` `requireSession` middleware mounted in
 * `app.ts`, so callers must present a valid SSO session cookie.
 * @param app Hono app, already wrapped with `requireSession` for /api/*.
 * @returns The same app for chaining.
 */
export const mountRunsRoute = (app: App): App => {
  app.get('/api/runs', handle)
  app.get('/api/subscribers/:id/runs', handleForSubscriber)
  return app
}
