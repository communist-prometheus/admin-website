import { publishPushState } from './broadcast'
import { fromRequest, listPending, txStore } from './idb'
import type { PushQueueEntry } from './types'

const writeIfFresh = async (
  entry: PushQueueEntry,
  duplicate: boolean
): Promise<boolean> => {
  const fresh = !duplicate
  await (fresh
    ? txStore('readwrite').then(s => fromRequest(s.put(entry)))
    : Promise.resolve())
  return fresh
}

const refreshPendingCount = async (
  status: 'idle' | 'syncing' | 'error'
): Promise<void> => {
  const pending = (await listPending()).length
  publishPushState({ status, pending })
}

/**
 * Persist a push queue entry. Idempotent on `sha` — re-enqueueing
 * the same commit is a no-op. Returns whether the entry was newly
 * added so callers can decide whether to trigger a drain.
 * @param entry Entry to append; `sha` must be unique per commit.
 * @returns True if the entry was new, false if a duplicate.
 */
export const enqueue = async (entry: PushQueueEntry): Promise<boolean> => {
  const store = await txStore('readonly')
  const existing = await fromRequest(store.get(entry.sha))
  const fresh = await writeIfFresh(entry, existing !== undefined)
  await (fresh ? refreshPendingCount('syncing') : Promise.resolve())
  return fresh
}

/**
 * Remove a queue entry by `sha`. Used after a successful push so
 * the entry is no longer retried.
 * @param sha Commit sha of the entry to remove.
 * @returns Resolves once the delete completes.
 */
export const dequeue = async (sha: string): Promise<void> => {
  const store = await txStore('readwrite')
  await fromRequest(store.delete(sha))
  const remaining = (await listPending()).length
  publishPushState({
    status: remaining === 0 ? 'idle' : 'syncing',
    pending: remaining,
  })
}

/**
 * Wipe every persisted entry. Used by tests and the future
 * "Reset queue" recovery action.
 * @returns Resolves once the store is empty.
 */
export const clearQueue = async (): Promise<void> => {
  const store = await txStore('readwrite')
  await fromRequest(store.clear())
  publishPushState({ status: 'idle', pending: 0 })
}
