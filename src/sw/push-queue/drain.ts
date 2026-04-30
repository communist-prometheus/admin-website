import { Option } from 'effect'
import { workerState } from '../state/state'
import { dequeue } from './enqueue'
import { listPending } from './idb'
import type { PushQueueEntry } from './types'

let inFlight = false

const tryPush = async (
  entry: PushQueueEntry,
  config: NonNullable<typeof workerState.config>
): Promise<boolean> => {
  const { pushToRemote } = await import('../git/remote/push-to-remote')
  await pushToRemote(config)
  await dequeue(entry.sha)
  return true
}

const processNext = (
  pending: readonly PushQueueEntry[],
  index: number,
  config: NonNullable<typeof workerState.config>
): Promise<void> =>
  Option.match(Option.fromNullable(pending[index]), {
    onNone: () => Promise.resolve(),
    onSome: async entry => {
      const ok = await tryPush(entry, config).catch(() => false)
      return ok ? processNext(pending, index + 1, config) : Promise.resolve()
    },
  })

const processPending = async (): Promise<void> =>
  Option.match(Option.fromNullable(workerState.config), {
    onNone: () => Promise.resolve(),
    onSome: async config => {
      const pending = await listPending()
      await processNext(pending, 0, config)
    },
  })

const runOnce = async (): Promise<void> => {
  inFlight = true
  try {
    await processPending()
  } finally {
    inFlight = false
  }
}

/**
 * Process queued push entries oldest-first. Each successful push
 * dequeues its entry; the first failure stops the drain so the
 * queue stays ordered for the next retry. Reentrant drain calls
 * coalesce — only one walk runs at a time.
 * @returns Resolves once the walk has finished or yielded.
 */
export const drainPushes = async (): Promise<void> => {
  const acquired = !inFlight
  await (acquired ? runOnce() : Promise.resolve())
}
