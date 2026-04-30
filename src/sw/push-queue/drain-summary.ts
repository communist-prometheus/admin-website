import {
  acknowledgeOfflineDrain,
  wasOfflineSinceDrain,
} from '../connectivity/sw-connectivity-state'
import { listPending } from './idb'
import { publishPushSummary } from './summary-broadcast'

/**
 * After a drain completes, compare the queue length before and
 * after to count successful pushes. When the SW saw an offline
 * transition since the previous drain, broadcast a "Synced N
 * change(s)" summary so the UI can confirm recovery.
 * @param initial Pending count captured before the drain ran.
 * @returns Resolves once the summary has been emitted (if any).
 */
export const announceDrainSummary = async (
  initial: number
): Promise<void> => {
  const final = (await listPending()).length
  const synced = Math.max(0, initial - final)
  const announce = synced > 0 && wasOfflineSinceDrain()
  const fire = announce
    ? () => {
        publishPushSummary(synced)
        acknowledgeOfflineDrain()
      }
    : (): void => undefined
  fire()
}
