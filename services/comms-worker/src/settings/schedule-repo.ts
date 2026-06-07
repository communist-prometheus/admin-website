import type { D1Database } from '@cloudflare/workers-types'
import type { Schedule } from '../cron/matcher'
import { nextRunAt } from '../cron/parse'

/** Schedule plus its next computed fire time, as returned by the repo. */
export type ScheduleWithNext = Schedule & { readonly nextRunAt: string }

type Row = { readonly value: string }

const KEY = 'schedule'
const SQL_GET = 'SELECT value FROM settings WHERE key = ?'
const SQL_UPSERT =
  'INSERT INTO settings (key, value) VALUES (?, ?) ' +
  'ON CONFLICT(key) DO UPDATE SET value = excluded.value'

const parse = (raw: string): Schedule => {
  const json = JSON.parse(raw) as Schedule
  return { cron: json.cron, timezone: json.timezone }
}

const withNext = (s: Schedule, now: Date): ScheduleWithNext => ({
  ...s,
  nextRunAt: nextRunAt(s, now),
})

/**
 * Read the saved cron schedule together with its next computed
 * fire time, or undefined when the row hasn't been seeded yet.
 * @param db D1 database binding.
 * @param now Clock used to compute the `nextRunAt` field.
 * @returns Saved schedule + `nextRunAt`, or undefined.
 */
export const fetchSchedule = async (
  db: D1Database,
  now: Date
): Promise<ScheduleWithNext | undefined> => {
  const row = (await db.prepare(SQL_GET).bind(KEY).first()) as Row | null
  return row === null ? undefined : withNext(parse(row.value), now)
}

/**
 * Persist a new cron schedule and return it with the recomputed
 * `nextRunAt` field.
 * @param db D1 database binding.
 * @param s New schedule to save.
 * @param now Clock used to compute the `nextRunAt` field.
 * @returns Persisted schedule + `nextRunAt`.
 */
export const persistSchedule = async (
  db: D1Database,
  s: Schedule,
  now: Date
): Promise<ScheduleWithNext> => {
  await db.prepare(SQL_UPSERT).bind(KEY, JSON.stringify(s)).run()
  return withNext(s, now)
}
