import { CronExpressionParser } from 'cron-parser'
import type { Schedule } from './matcher'

/** Discriminated result returned by {@link validateCron}. */
export type CronValidation =
  | { readonly ok: true }
  | { readonly ok: false; readonly error: string }

/**
 * Parse a 5-field cron expression and report whether it is well-formed.
 * @param cron Crontab string to validate.
 * @returns `{ok:true}` on success, `{ok:false,error}` with the parser's message.
 */
export const validateCron = (cron: string): CronValidation => {
  try {
    CronExpressionParser.parse(cron)
    return { ok: true }
  } catch (e) {
    const error = e instanceof Error ? e.message : 'invalid cron'
    return { ok: false, error }
  }
}

/**
 * Compute the next ISO-8601 UTC timestamp at which the schedule will fire.
 * @param schedule Saved cron + timezone.
 * @param from Reference point; the returned moment is strictly after this.
 * @returns ISO-8601 UTC string of the next expected fire time.
 */
export const nextRunAt = (schedule: Schedule, from: Date): string =>
  CronExpressionParser.parse(schedule.cron, {
    currentDate: from,
    tz: schedule.timezone,
  })
    .next()
    .toDate()
    .toISOString()
