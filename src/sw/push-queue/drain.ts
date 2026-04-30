import { Option } from 'effect'
import { isOnlineInSw } from '../connectivity/sw-connectivity-state'
import { workerState } from '../state/state'
import { publishPushState } from './broadcast'
import { announceDrainSummary } from './drain-summary'
import { listPending } from './idb'
import { processNext } from './process-next'

let inFlight = false

const surfaceOfflineHold = async (): Promise<void> => {
  const pending = (await listPending()).length
  publishPushState({ status: 'syncing', pending })
}

const processPending = async (): Promise<void> => {
  await (isOnlineInSw()
    ? Option.match(Option.fromNullable(workerState.config), {
        onNone: () => Promise.resolve(),
        onSome: async config => {
          const pending = await listPending()
          await processNext(pending, 0, config)
        },
      })
    : surfaceOfflineHold())
}

const runOnce = async (): Promise<void> => {
  inFlight = true
  const initial = (await listPending()).length
  try {
    await processPending()
    await announceDrainSummary(initial)
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
