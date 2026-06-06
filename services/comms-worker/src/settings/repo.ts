import type { D1Database } from '@cloudflare/workers-types'
import type { Schedule } from '../cron/matcher'
import { nextRunAt } from '../cron/parse'

/** Schedule plus its next computed fire time, as returned by the repo. */
export type ScheduleWithNext = Schedule & { readonly nextRunAt: string }

/** Repo facade for the `settings.schedule` row. */
export type SettingsRepo = {
  readonly getSchedule: (now: Date) => Promise<ScheduleWithNext | undefined>
  readonly setSchedule: (
    schedule: Schedule,
    now: Date
  ) => Promise<ScheduleWithNext>
}

type Deps = { readonly db: D1Database }
type Row = { readonly value: string }

const KEY = 'schedule'
const SQL_GET = 'SELECT value FROM settings WHERE key = ?'
const SQL_UPSERT =
  'INSERT INTO settings (key, value) VALUES (?, ?) ' +
  'ON CONFLICT(key) DO UPDATE SET value = excluded.value'

const parseRow = (raw: string): Schedule => {
  const json = JSON.parse(raw) as Schedule
  return { cron: json.cron, timezone: json.timezone }
}

const withNext = (s: Schedule, now: Date): ScheduleWithNext => ({
  ...s,
  nextRunAt: nextRunAt(s, now),
})

const fetchSchedule = async (
  db: D1Database,
  now: Date
): Promise<ScheduleWithNext | undefined> => {
  const row = (await db.prepare(SQL_GET).bind(KEY).first()) as Row | null
  return row === null ? undefined : withNext(parseRow(row.value), now)
}

const persistSchedule = async (
  db: D1Database,
  s: Schedule,
  now: Date
): Promise<ScheduleWithNext> => {
  await db.prepare(SQL_UPSERT).bind(KEY, JSON.stringify(s)).run()
  return withNext(s, now)
}

/**
 * Build a settings repo bound to the given D1 database.
 * @param d Injected dependencies.
 * @returns Repo facade.
 */
export const createSettingsRepo = (d: Deps): SettingsRepo => ({
  getSchedule: now => fetchSchedule(d.db, now),
  setSchedule: (s, now) => persistSchedule(d.db, s, now),
})
