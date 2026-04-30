import type { Span } from './span-types'

const DB_NAME = 'admin-tracing-export-queue'
const STORE_NAME = 'batches'
const VERSION = 1

/** FIFO eviction cap — older batches are dropped past this. */
export const MAX_QUEUED_BATCHES = 1000

/** Persisted batch waiting to be re-shipped after a failure. */
export type QueuedBatch = {
  readonly id: string
  readonly spans: ReadonlyArray<Span>
  readonly enqueuedAt: number
}

/**
 * Promisify an IDB request so callers can `await` it.
 * @param req IDB request to wrap.
 * @returns Promise resolving with `request.result`.
 */
const promisify = <T>(req: IDBRequest<T>): Promise<T> =>
  new Promise<T>((resolve, reject) => {
    req.onsuccess = (): void => resolve(req.result)
    req.onerror = (): void => reject(req.error)
  })

const openDb = (): Promise<IDBDatabase> => {
  const req = globalThis.indexedDB.open(DB_NAME, VERSION)
  req.onupgradeneeded = (): void => {
    req.result.createObjectStore(STORE_NAME, { keyPath: 'id' })
  }
  return promisify(req)
}

/**
 * Open the export queue object store inside a fresh transaction.
 * @param mode Transaction mode.
 * @returns Object store inside a freshly opened transaction.
 */
const txStore = async (mode: IDBTransactionMode): Promise<IDBObjectStore> => {
  const db = await openDb()
  return db.transaction(STORE_NAME, mode).objectStore(STORE_NAME)
}

/**
 * List queued batches sorted oldest-first.
 * @returns Frozen array of pending batches.
 */
export const listQueued = async (): Promise<readonly QueuedBatch[]> => {
  const store = await txStore('readonly')
  const all: readonly QueuedBatch[] = await promisify(store.getAll())
  return [...all].sort((a, b) => a.enqueuedAt - b.enqueuedAt)
}

export { promisify, txStore }
