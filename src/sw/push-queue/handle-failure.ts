import { publishPushState } from './broadcast'
import { classifyPushError } from './classify-error'
import { publishPushError } from './error-broadcast'
import { shouldRetry } from './retry-policy'
import { scheduleRetry } from './schedule-retry'
import type { PushQueueEntry } from './types'
import { bumpAttempt } from './update-attempt'

/**
 * React to a failed push attempt. Retriable failures bump the
 * attempt counter, schedule the next drain, and surface a
 * non-terminal error event. Terminal failures (auth /
 * non-fast-forward / validation / retry-cap) leave the entry in
 * place and surface a terminal event so the UI can offer a Retry
 * CTA on user action.
 * @param entry Failed queue entry.
 * @param remaining Pending count covering the entry and everything after.
 * @param error Raw error from the push pipeline.
 * @returns Resolves once side effects (broadcast, schedule) are queued.
 */
export const handleFailure = async (
  entry: PushQueueEntry,
  remaining: number,
  error: unknown
): Promise<void> => {
  const reason = classifyPushError(error)
  const attempt = entry.attempt ?? 1
  const retry = shouldRetry(reason, attempt)
  publishPushState({ status: 'error', pending: remaining })
  publishPushError(entry, reason, !retry)
  const schedule = retry
    ? async (): Promise<void> => {
        await bumpAttempt(entry)
        scheduleRetry(attempt)
      }
    : async (): Promise<void> => undefined
  await schedule()
}
