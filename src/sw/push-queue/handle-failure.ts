import { publishPushState } from './broadcast'
import { classifyPushError } from './classify-error'
import { publishPushError } from './error-broadcast'
import { tryMergeAfterNff } from './handle-nff'
import { shouldRetry } from './retry-policy'
import { scheduleRetry } from './schedule-retry'
import type { PushQueueEntry } from './types'
import { bumpAttempt } from './update-attempt'

const scheduleAfterMerge = async (entry: PushQueueEntry): Promise<void> => {
  await bumpAttempt(entry)
  scheduleRetry(entry.attempt ?? 1)
}

const handleNonFastForward = async (
  entry: PushQueueEntry,
  remaining: number
): Promise<void> => {
  const outcome = await tryMergeAfterNff(entry)
  const cleanMerge = outcome.kind === 'clean'
  publishPushState({
    status: cleanMerge ? 'syncing' : 'error',
    pending: remaining,
  })
  publishPushError(entry, 'non-fast-forward', !cleanMerge)
  await (cleanMerge ? scheduleAfterMerge(entry) : Promise.resolve())
}

const handleGenericFailure = async (
  entry: PushQueueEntry,
  remaining: number,
  reason: ReturnType<typeof classifyPushError>,
  retry: boolean
): Promise<void> => {
  publishPushState({ status: 'error', pending: remaining })
  publishPushError(entry, reason, !retry)
  await (retry ? scheduleAfterMerge(entry) : Promise.resolve())
}

/**
 * React to a failed push attempt. Non-fast-forward triggers an
 * auto-merge — clean merges retry, conflicts surface via the
 * conflict channel. Other transient errors bump the attempt
 * counter and schedule a backoff retry. Terminal failures emit
 * a terminal error event for the UI.
 * @param entry Failed queue entry.
 * @param remaining Pending count covering the entry and everything after.
 * @param error Raw error from the push pipeline.
 * @returns Resolves once side effects are queued.
 */
export const handleFailure = async (
  entry: PushQueueEntry,
  remaining: number,
  error: unknown
): Promise<void> => {
  const reason = classifyPushError(error)
  const attempt = entry.attempt ?? 1
  const retry = shouldRetry(reason, attempt)
  await (reason === 'non-fast-forward'
    ? handleNonFastForward(entry, remaining)
    : handleGenericFailure(entry, remaining, reason, retry))
}
