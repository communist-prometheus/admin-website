import type { QuotaKind } from '../resend/response'

/**
 * Start of the next UTC day, strictly after `from`. This is when
 * Resend's daily sending quota resets (midnight UTC), so a dispatch
 * paused on a `daily_quota_exceeded` may resume at exactly this moment.
 * `Date.UTC` normalises the day-overflow across month/year boundaries.
 * @param from Tick moment the quota was hit at.
 * @returns The next 00:00:00.000 UTC after `from`.
 */
export const nextUtcMidnight = (from: Date): Date =>
  new Date(
    Date.UTC(
      from.getUTCFullYear(),
      from.getUTCMonth(),
      from.getUTCDate() + 1,
      0,
      0,
      0,
      0
    )
  )

/**
 * Start of the next UTC month, strictly after `from` — when Resend's
 * monthly quota resets. `Date.UTC` normalises the month-overflow at the
 * year boundary.
 * @param from Tick moment the quota was hit at.
 * @returns The first instant of the next calendar month, UTC.
 */
export const nextUtcMonth = (from: Date): Date =>
  new Date(
    Date.UTC(from.getUTCFullYear(), from.getUTCMonth() + 1, 1, 0, 0, 0, 0)
  )

const RESET_BY_KIND: Record<QuotaKind, (from: Date) => Date> = {
  daily: nextUtcMidnight,
  monthly: nextUtcMonth,
}

/**
 * The moment a dispatch paused on a quota rejection may resume — the
 * next reset boundary for that quota kind. Deferring un-sent recipients
 * to this instant is what turns an hourly-hammering failure loop into a
 * single "retry after the quota resets".
 * @param quota Which Resend quota was exhausted.
 * @param from Tick moment the quota was hit at.
 * @returns The resume instant.
 */
export const resumeAt = (quota: QuotaKind, from: Date): Date =>
  RESET_BY_KIND[quota](from)
