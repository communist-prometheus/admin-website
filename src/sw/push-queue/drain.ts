import { Option } from 'effect'
import { workerState } from '../state/state'
import { listPending } from './idb'
import { processNext } from './process-next'

let inFlight = false

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
 * dequeues its entry; the first failure stops the walk so the
 * queue stays ordered for the next retry. Reentrant drain calls
 * coalesce — only one walk runs at a time.
 * @returns Resolves once the walk has finished or yielded.
 */
export const drainPushes = async (): Promise<void> => {
  const acquired = !inFlight
  await (acquired ? runOnce() : Promise.resolve())
}
