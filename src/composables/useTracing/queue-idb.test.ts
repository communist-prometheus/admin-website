import 'fake-indexeddb/auto'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { listQueued, MAX_QUEUED_BATCHES } from './queue-idb'
import {
  clearQueuedBatches,
  dropBatch,
  enqueueBatch,
} from './queue-idb-write'
import type { Span } from './span-types'

const span = (id: string): Span => ({
  id,
  traceId: 't',
  parentId: undefined,
  name: id,
  startedAt: 1,
  finishedAt: 2,
  attributes: {},
  status: 'ok',
})

describe('export queue idb', () => {
  beforeEach(async () => {
    await clearQueuedBatches()
  })
  afterEach(async () => {
    await clearQueuedBatches()
  })

  it('enqueueBatch + listQueued round-trip', async () => {
    await enqueueBatch([span('a'), span('b')])
    const all = await listQueued()
    expect(all).toHaveLength(1)
    expect(all[0]?.spans).toHaveLength(2)
  })

  it(
    'evicts oldest past MAX_QUEUED_BATCHES',
    { timeout: 30_000 },
    async () => {
      const total = MAX_QUEUED_BATCHES + 5
      for (let i = 0; i < total; i += 1) {
        await enqueueBatch([span(`s${i}`)])
      }
      const all = await listQueued()
      expect(all).toHaveLength(MAX_QUEUED_BATCHES)
      expect(all[0]?.spans[0]?.id).toBe('s5')
    }
  )

  it('dropBatch removes a single entry', async () => {
    const a = await enqueueBatch([span('a')])
    await enqueueBatch([span('b')])
    await dropBatch(a.id)
    const all = await listQueued()
    expect(all).toHaveLength(1)
  })
})
