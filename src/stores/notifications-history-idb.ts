import type { HistoryEntry } from './notifications-history-types'

const DB_NAME = 'admin-notifications'
const STORE_NAME = 'history'
const VERSION = 1

/** Maximum entries retained in the persisted history. */
export const MAX_HISTORY = 200

/**
 * Wrap an `IDBRequest` as a Promise that resolves with `result`
 * on success and rejects with `error` on failure.
 * @param request The IDB request to await.
 * @returns Promise resolving with the request result.
 */
const promisify = <T>(request: IDBRequest<T>): Promise<T> =>
  new Promise<T>((resolve, reject) => {
    request.onsuccess = (): void => resolve(request.result)
    request.onerror = (): void => reject(request.error)
  })

const openDb = (): Promise<IDBDatabase> => {
  const req = globalThis.indexedDB.open(DB_NAME, VERSION)
  req.onupgradeneeded = (): void => {
    req.result.createObjectStore(STORE_NAME, { keyPath: 'id' })
  }
  return promisify(req)
}

/**
 * Acquire a fresh transactional object store. Each public action
 * opens its own transaction so async awaits never span an
 * already-completed IDB transaction.
 * @param mode Transaction mode.
 * @returns Object store handle inside a fresh transaction.
 */
export const txStore = async (
  mode: IDBTransactionMode
): Promise<IDBObjectStore> => {
  const db = await openDb()
  return db.transaction(STORE_NAME, mode).objectStore(STORE_NAME)
}

/** Wrap an IDBRequest as a Promise; resolves with `result`. */
export const fromRequest = promisify

/**
 * Read every persisted history entry sorted oldest-first.
 * @returns Frozen array of all entries.
 */
export const listAll = async (): Promise<readonly HistoryEntry[]> => {
  const store = await txStore('readonly')
  const all: readonly HistoryEntry[] = await fromRequest(store.getAll())
  return [...all].sort((a, b) => a.createdAt - b.createdAt)
}
