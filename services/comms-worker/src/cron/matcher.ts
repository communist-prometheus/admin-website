import { CronExpressionParser } from 'cron-parser'

/** Persisted schedule shape: 5-field crontab + IANA timezone. */
export type Schedule = {
  readonly cron: string
  readonly timezone: string
}

/** Forgiveness window between expected fire and the actual heartbeat. */
export const TICK_WINDOW_MS = 5 * 60 * 1000

/**
 * True iff a heartbeat at `tickAt` lands within `TICK_WINDOW_MS` after the
 * most-recent expected fire time of the schedule's crontab, computed in its
 * saved IANA timezone (DST-aware via cron-parser).
 * @param schedule Saved cron + timezone.
 * @param tickAt Heartbeat moment under test (UTC).
 * @returns Whether dispatch should run for this tick.
 */
export const matchesTick = (schedule: Schedule, tickAt: Date): boolean => {
  const tickMs = tickAt.getTime()
  const lookbackStart = new Date(tickMs - TICK_WINDOW_MS - 1)
  const iter = CronExpressionParser.parse(schedule.cron, {
    currentDate: lookbackStart,
    tz: schedule.timezone,
  })
  const nextMs = iter.next().toDate().getTime()
  return nextMs <= tickMs
}
