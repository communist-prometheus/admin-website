import type { PushQueueEntry } from './types'

const DB_NAME = 'admin-push-queue'
const STORE_NAME = 'queue'
const VERSION = 1

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
    req.result.createObjectStore(STORE_NAME, { keyPath: 'sha' })
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
 * List every persisted queue entry sorted oldest-first.
 * @returns Frozen array of all queued entries.
 */
export const listPending = async (): Promise<readonly PushQueueEntry[]> => {
  const store = await txStore('readonly')
  const all: readonly PushQueueEntry[] = await fromRequest(store.getAll())
  return [...all].sort((a, b) => a.enqueuedAt - b.enqueuedAt)
}
