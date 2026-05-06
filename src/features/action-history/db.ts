import {
  HISTORY_DB_NAME,
  HISTORY_DB_VERSION,
  HISTORY_STORE_NAME,
} from './config'
import type { ActionEntry } from './types'

const promisify = <T>(req: IDBRequest<T>): Promise<T> =>
  new Promise<T>((resolve, reject) => {
    req.onsuccess = (): void => resolve(req.result)
    req.onerror = (): void => reject(req.error)
  })

const openDb = (): Promise<IDBDatabase> => {
  const req = globalThis.indexedDB.open(HISTORY_DB_NAME, HISTORY_DB_VERSION)
  req.onupgradeneeded = (): void => {
    req.result.createObjectStore(HISTORY_STORE_NAME, { keyPath: 'id' })
  }
  return promisify(req)
}

const txStore = async (mode: IDBTransactionMode): Promise<IDBObjectStore> => {
  const db = await openDb()
  return db
    .transaction(HISTORY_STORE_NAME, mode)
    .objectStore(HISTORY_STORE_NAME)
}

/**
 * Read every persisted entry sorted oldest-first.
 * @returns Frozen array of entries
 */
export const listEntries = async (): Promise<readonly ActionEntry[]> => {
  const store = await txStore('readonly')
  const all: readonly ActionEntry[] = await promisify(store.getAll())
  return [...all].sort((a, b) => a.ts - b.ts)
}

/**
 * Persist a new entry.
 * @param entry - Stamped entry with id + ts
 */
export const putEntry = async (entry: ActionEntry): Promise<void> => {
  const store = await txStore('readwrite')
  await promisify(store.put(entry))
}

/**
 * Drop a set of entry ids.
 * @param ids - Identifiers to delete
 */
export const deleteEntries = async (
  ids: readonly string[]
): Promise<void> => {
  await Promise.all(
    ids.map(async id => {
      const store = await txStore('readwrite')
      await promisify(store.delete(id))
    })
  )
}

/**
 * Wipe the entire object store.
 */
export const clearEntries = async (): Promise<void> => {
  const store = await txStore('readwrite')
  await promisify(store.clear())
}
