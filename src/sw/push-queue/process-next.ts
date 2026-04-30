import { Option } from 'effect'
import type { workerState } from '../state/state'
import { publishPushState } from './broadcast'
import { dequeue } from './enqueue'
import type { PushQueueEntry } from './types'

const tryPush = async (
  entry: PushQueueEntry,
  config: NonNullable<typeof workerState.config>
): Promise<boolean> => {
  const { pushToRemote } = await import('../git/remote/push-to-remote')
  await pushToRemote(config)
  await dequeue(entry.sha)
  return true
}

const haltOnFailure = (remaining: number): Promise<void> => {
  publishPushState({ status: 'error', pending: remaining })
  return Promise.resolve()
}

/**
 * Recursively push the queue starting at `index`. Stops on the
 * first failure and emits an error state covering the entries
 * that remain unprocessed.
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
      const ok = await tryPush(entry, config).catch(() => false)
      return ok
        ? processNext(pending, index + 1, config)
        : haltOnFailure(pending.length - index)
    },
  })
