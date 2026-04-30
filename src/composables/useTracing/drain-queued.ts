import { sendBatch } from './exporter-send'
import { listQueued, type QueuedBatch } from './queue-idb'
import { dropBatch } from './queue-idb-write'

const tryNext = async (
  pending: readonly QueuedBatch[],
  index: number,
  shipped: number
): Promise<number> => {
  const batch = pending[index]
  return batch === undefined
    ? shipped
    : tryShip(pending, index, batch, shipped)
}

const tryShip = async (
  pending: readonly QueuedBatch[],
  index: number,
  batch: QueuedBatch,
  shipped: number
): Promise<number> => {
  const ok = await sendBatch(batch.spans)
  await (ok ? dropBatch(batch.id) : Promise.resolve())
  return ok ? tryNext(pending, index + 1, shipped + 1) : shipped
}

/**
 * Walk the persisted queue oldest-first and ship every batch.
 * Drops shipped batches; halts on the first failure so the
 * queue order stays preserved for the next drain.
 * @returns Number of batches successfully shipped.
 */
export const drainQueuedBatches = async (): Promise<number> => {
  const pending = await listQueued()
  return tryNext(pending, 0, 0)
}
