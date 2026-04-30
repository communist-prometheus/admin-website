import {
  fromRequest,
  listAll,
  MAX_HISTORY,
  txStore,
} from './notifications-history-idb'
import type { HistoryEntry } from './notifications-history-types'

const evictOverflow = async (): Promise<void> => {
  const all = await listAll()
  const overflow = all.length - MAX_HISTORY
  const toRemove = overflow > 0 ? all.slice(0, overflow) : []
  await Promise.all(
    toRemove.map(async entry => {
      const store = await txStore('readwrite')
      await fromRequest(store.delete(entry.id))
    })
  )
}

/**
 * Append a new history entry, evicting the oldest entries when the
 * total exceeds the FIFO cap.
 * @param entry Entry to append; id must already be assigned.
 * @returns Resolves once write + eviction complete.
 */
export const append = async (entry: HistoryEntry): Promise<void> => {
  const store = await txStore('readwrite')
  await fromRequest(store.put(entry))
  await evictOverflow()
}

/**
 * Stamp every unread entry as read with the current timestamp.
 * @returns Resolves once all writes complete.
 */
export const markAllRead = async (): Promise<void> => {
  const all = await listAll()
  const stamp = Date.now()
  await Promise.all(
    all.map(async entry => {
      const store = await txStore('readwrite')
      await fromRequest(store.put({ ...entry, readAt: stamp }))
    })
  )
}

/**
 * Remove a single entry by id.
 * @param id Entry id; missing ids are silently ignored.
 * @returns Resolves once the delete completes.
 */
export const removeOne = async (id: string): Promise<void> => {
  const store = await txStore('readwrite')
  await fromRequest(store.delete(id))
}

/**
 * Wipe all persisted history entries.
 * @returns Resolves once the store is empty.
 */
export const clearAll = async (): Promise<void> => {
  const store = await txStore('readwrite')
  await fromRequest(store.clear())
}
