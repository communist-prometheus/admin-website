import 'fake-indexeddb/auto'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { clearQueue, dequeue, enqueue } from './enqueue'
import { listPending } from './idb'
import type { PushQueueEntry } from './types'

const entry = (sha: string, ts: number): PushQueueEntry => ({
  sha,
  branch: 'develop',
  message: `commit ${sha}`,
  enqueuedAt: ts,
})

describe('push queue', () => {
  beforeEach(async () => {
    await clearQueue()
  })
  afterEach(async () => {
    await clearQueue()
  })

  it('enqueue persists an entry visible via listPending', async () => {
    await enqueue(entry('a1', 100))
    const all = await listPending()
    expect(all).toHaveLength(1)
    expect(all[0]?.sha).toBe('a1')
  })

  it('listPending returns entries oldest-first', async () => {
    await enqueue(entry('c', 300))
    await enqueue(entry('a', 100))
    await enqueue(entry('b', 200))
    const all = await listPending()
    expect(all.map(e => e.sha)).toEqual(['a', 'b', 'c'])
  })

  it('enqueue is idempotent on sha', async () => {
    const first = await enqueue(entry('a', 100))
    const second = await enqueue(entry('a', 200))
    expect(first).toBe(true)
    expect(second).toBe(false)
    const all = await listPending()
    expect(all).toHaveLength(1)
    expect(all[0]?.enqueuedAt).toBe(100)
  })

  it('dequeue removes a single entry', async () => {
    await enqueue(entry('a', 100))
    await enqueue(entry('b', 200))
    await dequeue('a')
    const all = await listPending()
    expect(all.map(e => e.sha)).toEqual(['b'])
  })

  it('dequeue with unknown sha is a no-op', async () => {
    await enqueue(entry('a', 100))
    await dequeue('does-not-exist')
    expect(await listPending()).toHaveLength(1)
  })
})
