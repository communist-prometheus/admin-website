import {
  listQueued,
  MAX_QUEUED_BATCHES,
  promisify,
  type QueuedBatch,
  txStore,
} from './queue-idb'
import { randomHex } from './random-hex'
import type { Span } from './span-types'

let seq = 0

const evictOverflow = async (): Promise<void> => {
  const all = await listQueued()
  const overflow = all.length - MAX_QUEUED_BATCHES
  const toRemove = overflow > 0 ? all.slice(0, overflow) : []
  await Promise.all(
    toRemove.map(async batch => {
      const store = await txStore('readwrite')
      await promisify(store.delete(batch.id))
    })
  )
}

/**
 * Persist a failed batch so it can be retried after reconnect.
 * Returns the queued entry so the caller can log / cancel it.
 * @param spans Spans to retain.
 * @returns The persisted batch record.
 */
export const enqueueBatch = async (
  spans: ReadonlyArray<Span>
): Promise<QueuedBatch> => {
  seq += 1
  const entry: QueuedBatch = {
    id: randomHex(8),
    spans,
    enqueuedAt: Date.now() * 1000 + (seq % 1000),
  }
  const store = await txStore('readwrite')
  await promisify(store.put(entry))
  await evictOverflow()
  return entry
}

/**
 * Drop a persisted batch by id. Used after a successful resend.
 * @param id Batch id from `enqueueBatch`.
 * @returns Resolves once the delete completes.
 */
export const dropBatch = async (id: string): Promise<void> => {
  const store = await txStore('readwrite')
  await promisify(store.delete(id))
}

/**
 * Wipe every queued batch. Used by tests.
 * @returns Resolves once the store is empty.
 */
export const clearQueuedBatches = async (): Promise<void> => {
  const store = await txStore('readwrite')
  await promisify(store.clear())
}
