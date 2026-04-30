import { fromRequest, txStore } from './idb'
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
  return writeIfFresh(entry, existing !== undefined)
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
}

/**
 * Wipe every persisted entry. Used by tests and the future
 * "Reset queue" recovery action.
 * @returns Resolves once the store is empty.
 */
export const clearQueue = async (): Promise<void> => {
  const store = await txStore('readwrite')
  await fromRequest(store.clear())
}
