import type { Context } from 'hono'
import type { SettingsRepo } from '../settings/repo'
import { validateScheduleBody } from './validate'

/** Type of the request-bound clock used by the handlers. */
export type NowFn = () => Date

/** GET /api/schedule — return current saved schedule or the seed default. */
export const handleGetSchedule = async (
  c: Context,
  repo: SettingsRepo,
  now: NowFn
): Promise<Response> => {
  const sched = await repo.getSchedule(now())
  if (sched === undefined) return c.json({ error: 'not_found' }, 404)
  return c.json(sched)
}

/** PUT /api/schedule — validate body then persist. */
export const handlePutSchedule = async (
  c: Context,
  repo: SettingsRepo,
  now: NowFn
): Promise<Response> => {
  const body = await c.req.json().catch(() => undefined)
  const parsed = validateScheduleBody(body)
  if (!parsed.ok) return c.json({ error: parsed.error }, 422)
  const saved = await repo.setSchedule(parsed.value, now())
  return c.json(saved)
}
