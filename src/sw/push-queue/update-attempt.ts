import { fromRequest, txStore } from './idb'
import type { PushQueueEntry } from './types'

/**
 * Persist an incremented attempt count on an existing queue
 * entry. Used by the retry path so the next failure picks up the
 * correct backoff slot.
 * @param entry Source entry; attempt is bumped by one.
 * @returns Resolves once the rewrite completes.
 */
export const bumpAttempt = async (entry: PushQueueEntry): Promise<void> => {
  const next: PushQueueEntry = {
    ...entry,
    attempt: (entry.attempt ?? 1) + 1,
  }
  const store = await txStore('readwrite')
  await fromRequest(store.put(next))
}
