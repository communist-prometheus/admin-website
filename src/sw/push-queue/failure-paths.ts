import type { PushFailureReason } from '../protocol/push-error'
import type { MergeOutcome } from './attempt-merge'
import { publishPushState } from './broadcast'
import { publishPushError } from './error-broadcast'
import { tryMergeAfterNff } from './handle-nff'
import { MAX_ATTEMPTS } from './retry-policy'
import { scheduleRetry } from './schedule-retry'
import type { PushQueueEntry } from './types'
import { bumpAttempt } from './update-attempt'

const scheduleAfterMerge = async (entry: PushQueueEntry): Promise<void> => {
  await bumpAttempt(entry)
  // Use the bumped value (bumpAttempt persists attempt+1 to IDB but does
  // not mutate `entry`) and cap the recovery loop at MAX_ATTEMPTS so a
  // never-converging push can't reschedule forever.
  const next = (entry.attempt ?? 1) + 1
  void (next < MAX_ATTEMPTS ? scheduleRetry(next) : undefined)
}

const recoverable = (outcome: MergeOutcome): boolean =>
  outcome.kind === 'clean' || outcome.kind === 'rebased'

/**
 * Handle a non-fast-forward push: reconcile via merge or reset-onto-remote
 * replay, re-draining on success and surfacing a terminal error otherwise.
 * @param entry Failed queue entry.
 * @param remaining Pending count covering the entry and everything after.
 */
export const handleNonFastForward = async (
  entry: PushQueueEntry,
  remaining: number
): Promise<void> => {
  const outcome = await tryMergeAfterNff(entry)
  const ok = recoverable(outcome)
  publishPushState({ status: ok ? 'syncing' : 'error', pending: remaining })
  publishPushError(entry, 'non-fast-forward', !ok)
  await (ok ? scheduleAfterMerge(entry) : Promise.resolve())
}

/**
 * Handle a non-NFF failure: back off + retry when retriable, else surface a
 * terminal error.
 * @param entry Failed queue entry.
 * @param remaining Pending count covering the entry and everything after.
 * @param reason Classified failure reason.
 * @param retry Whether a further retry is permitted.
 */
export const handleGenericFailure = async (
  entry: PushQueueEntry,
  remaining: number,
  reason: PushFailureReason,
  retry: boolean
): Promise<void> => {
  publishPushState({ status: 'error', pending: remaining })
  publishPushError(entry, reason, !retry)
  await (retry ? scheduleAfterMerge(entry) : Promise.resolve())
}
