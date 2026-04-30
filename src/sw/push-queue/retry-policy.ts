import type { PushFailureReason } from '../protocol/push-error'

/** Maximum retry attempts (including the original try). */
export const MAX_ATTEMPTS = 5

/** Backoff schedule (ms) per attempt index 1..MAX_ATTEMPTS-1. */
const BACKOFF_MS: ReadonlyArray<number> = [
  2_000, 4_000, 8_000, 16_000, 32_000,
]

const RETRIABLE: ReadonlySet<PushFailureReason> = new Set([
  'network',
  'unknown',
])

/**
 * Decide whether a classified failure should retry given the
 * current attempt count. Auth / non-fast-forward / validation are
 * never retried automatically — they require user action.
 * @param reason Classified failure reason.
 * @param attempt Number of attempts already made (1-indexed).
 * @returns True if a further retry is permitted.
 */
export const shouldRetry = (
  reason: PushFailureReason,
  attempt: number
): boolean => RETRIABLE.has(reason) && attempt < MAX_ATTEMPTS

const clampIndex = (attempt: number): number =>
  Math.max(0, Math.min(BACKOFF_MS.length - 1, attempt - 1))

/**
 * Lookup the backoff delay (ms) for the given attempt index.
 * Clamps to the first/last configured delay outside the table.
 * @param attempt 1-indexed attempt count just completed.
 * @returns Delay before the next attempt.
 */
export const backoffMs = (attempt: number): number =>
  BACKOFF_MS[clampIndex(attempt)] ?? 32_000
