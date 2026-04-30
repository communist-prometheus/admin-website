import { Option } from 'effect'
import type { workerState } from '../state/state'
import { handleFailure } from './handle-failure'
import { pushOnce } from './push-once'
import type { PushQueueEntry } from './types'

/**
 * Recursively push the queue starting at `index`. Stops on the
 * first failure, delegating retry policy + broadcasting to
 * `handleFailure`. Successful pushes advance to the next entry.
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
        : handleFailure(entry, pending.length - index, result.error)
    },
  })
