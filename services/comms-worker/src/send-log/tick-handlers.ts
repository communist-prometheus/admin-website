import type { Context } from 'hono'
import type { Bindings } from '../bindings'
import { listByTickWithEmail } from './by-tick'
import { listTickSummaries } from './ticks'

/*
 * A dispatch writes one row per recipient, so the flat `/api/runs` feed
 * is not a run history. These read the history the way the editor
 * thinks of it: the list of dispatches, and — on opening one — the
 * recipients that dispatch reached.
 */

const DEFAULT_LIMIT = 50
const MAX_LIMIT = 100

const dbOf = (c: Context) => (c.env as Bindings).DB

const parseCount = (raw: string | undefined, fallback: number): number => {
  if (raw === undefined) return fallback
  const n = Number(raw)
  return Number.isInteger(n) && n >= 0 ? n : fallback
}

/** GET /api/runs/ticks — one entry per dispatch, newest first. */
export const handleTicks = async (c: Context): Promise<Response> => {
  const limit = Math.min(
    parseCount(c.req.query('limit'), DEFAULT_LIMIT) || DEFAULT_LIMIT,
    MAX_LIMIT
  )
  const offset = parseCount(c.req.query('offset'), 0)
  const ticks = await listTickSummaries(dbOf(c), limit, offset)
  return c.json({ ticks })
}

/** GET /api/runs/tick?at=ISO — the recipients of one dispatch. */
export const handleOneTick = async (c: Context): Promise<Response> => {
  const at = c.req.query('at')
  if (at === undefined || at === '')
    return c.json({ error: 'at is required' }, 400)
  const runs = await listByTickWithEmail(dbOf(c), at)
  return c.json({ runs })
}
