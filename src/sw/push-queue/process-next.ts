import { Option } from 'effect'
import type { workerState } from '../state/state'
import { publishPushState } from './broadcast'
import { publishPushError } from './error-broadcast'
import { pushOnce } from './push-once'
import type { PushQueueEntry } from './types'

const haltOnFailure = (
  entry: PushQueueEntry,
  remaining: number,
  error: unknown
): Promise<void> => {
  publishPushState({ status: 'error', pending: remaining })
  publishPushError(entry, error)
  return Promise.resolve()
}

/**
 * Recursively push the queue starting at `index`. Stops on the
 * first failure, emits an error state covering the unprocessed
 * entries, and broadcasts a classified `PushErrorEvent` so the
 * client can surface a typed notification.
 * @param pending Entries to process (oldest-first).
 * @param index Current position in `pending`.
 * @param config SW git configuration.
 * @returns Resolves once the walk has finished or yielded.
 */
export const processNext = (
  pending: readonly PushQueueEntry[],
  index: number,
  config: NonNullable<typeof workerState.config>
): Promise<void> =>
  Option.match(Option.fromNullable(pending[index]), {
    onNone: () => Promise.resolve(),
    onSome: async entry => {
      const result = await pushOnce(entry, config)
      return result.ok
        ? processNext(pending, index + 1, config)
        : haltOnFailure(entry, pending.length - index, result.error)
    },
  })
