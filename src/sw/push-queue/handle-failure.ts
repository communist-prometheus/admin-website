import { log } from '../logging/logger'
import { classifyPushError } from './classify-error'
import { handleGenericFailure, handleNonFastForward } from './failure-paths'
import { shouldRetry } from './retry-policy'
import type { PushQueueEntry } from './types'

/**
 * React to a failed push attempt. Non-fast-forward (incl. unrelated /
 * shallow-diverged) reconciles via merge or reset-onto-remote replay; a
 * genuine conflict surfaces via the conflict channel; other transient
 * errors back off and retry. The raw error is logged first so the cause is
 * never hidden behind a classified reason.
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
  log(
    'warn',
    'git',
    `push failed [${reason}]: ${error instanceof Error ? error.message : String(error)}`
  )
  const retry = shouldRetry(reason, entry.attempt ?? 1)
  await (reason === 'non-fast-forward'
    ? handleNonFastForward(entry, remaining)
    : handleGenericFailure(entry, remaining, reason, retry))
}
