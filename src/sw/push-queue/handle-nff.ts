import { workerState } from '../state/state'
import { attemptMerge, type MergeOutcome } from './attempt-merge'
import { publishPushConflict } from './conflict-broadcast'
import type { PushQueueEntry } from './types'

const noConfigOutcome: MergeOutcome = {
  kind: 'fail',
  error: new Error('SW git config missing'),
}

/**
 * Try to merge the remote branch in response to a non-fast-
 * forward push rejection. Returns the merge outcome so the
 * failure handler can decide whether to re-drain (clean), surface
 * a conflict notification (conflict), or fall through to the
 * generic terminal-error path (fail).
 * @param entry Failed queue entry whose push triggered the merge.
 * @returns Discriminated outcome (clean / conflict / fail).
 */
export const tryMergeAfterNff = async (
  entry: PushQueueEntry
): Promise<MergeOutcome> => {
  const config = workerState.config
  const outcome =
    config === undefined ? noConfigOutcome : await attemptMerge(config, entry)
  const noop = (): void => undefined
  const fire =
    outcome.kind === 'conflict'
      ? () => publishPushConflict(entry, outcome.files)
      : noop
  fire()
  return outcome
}
