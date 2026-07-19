import type { D1Database } from '@cloudflare/workers-types'
import type { Schedule } from '../cron/matcher'
import { dropCutoffAt, fetchCutoffAt, persistCutoffAt } from './cutoff-repo'
import {
  dropPausedUntil,
  fetchPausedUntil,
  persistPausedUntil,
} from './pause-repo'
import {
  fetchSchedule,
  persistSchedule,
  type ScheduleWithNext,
} from './schedule-repo'

export type { ScheduleWithNext } from './schedule-repo'

/** Repo facade for the `settings` table. */
export type SettingsRepo = {
  readonly getSchedule: (now: Date) => Promise<ScheduleWithNext | undefined>
  readonly setSchedule: (
    schedule: Schedule,
    now: Date
  ) => Promise<ScheduleWithNext>
  readonly getCutoffAt: () => Promise<string | undefined>
  readonly setCutoffAt: (iso: string) => Promise<void>
  readonly clearCutoffAt: () => Promise<void>
  readonly getPausedUntil: () => Promise<string | undefined>
  readonly setPausedUntil: (iso: string) => Promise<void>
  readonly clearPausedUntil: () => Promise<void>
}

type Deps = { readonly db: D1Database }

/**
 * Build a settings repo bound to the given D1 database. Exposes both
 * the cron schedule and the global "cutoff_at" watermark used by the
 * dispatch loop to decide what counts as a "new" article.
 * @param d Injected dependencies.
 * @returns Repo facade.
 */
export const createSettingsRepo = (d: Deps): SettingsRepo => ({
  getSchedule: now => fetchSchedule(d.db, now),
  setSchedule: (s, now) => persistSchedule(d.db, s, now),
  getCutoffAt: () => fetchCutoffAt(d.db),
  setCutoffAt: iso => persistCutoffAt(d.db, iso),
  clearCutoffAt: () => dropCutoffAt(d.db),
  getPausedUntil: () => fetchPausedUntil(d.db),
  setPausedUntil: iso => persistPausedUntil(d.db, iso),
  clearPausedUntil: () => dropPausedUntil(d.db),
})
