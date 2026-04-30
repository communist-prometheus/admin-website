import 'fake-indexeddb/auto'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { listAll, MAX_HISTORY } from './notifications-history-idb'
import {
  append,
  clearAll,
  markAllRead,
  removeOne,
} from './notifications-history-idb-write'
import type { HistoryEntry } from './notifications-history-types'

const entry = (id: string, createdAt: number): HistoryEntry => ({
  id,
  kind: 'info',
  title: `t-${id}`,
  createdAt,
})

describe('notifications history idb', () => {
  beforeEach(async () => {
    await clearAll()
  })
  afterEach(async () => {
    await clearAll()
  })

  it('append + listAll round-trip preserves order by createdAt', async () => {
    await append(entry('a', 200))
    await append(entry('b', 100))
    await append(entry('c', 300))
    const all = await listAll()
    expect(all.map(e => e.id)).toEqual(['b', 'a', 'c'])
  })

  it('FIFO eviction trims oldest above MAX_HISTORY', async () => {
    const total = MAX_HISTORY + 5
    for (let i = 0; i < total; i += 1) {
      await append(entry(`e${i}`, i))
    }
    const all = await listAll()
    expect(all).toHaveLength(MAX_HISTORY)
    expect(all[0]?.id).toBe('e5')
    expect(all[all.length - 1]?.id).toBe(`e${total - 1}`)
  })

  it('markAllRead stamps readAt on every entry', async () => {
    await append(entry('a', 1))
    await append(entry('b', 2))
    await markAllRead()
    const all = await listAll()
    for (const e of all) {
      expect(e.readAt).toBeGreaterThan(0)
    }
  })

  it('removeOne deletes only the requested id', async () => {
    await append(entry('a', 1))
    await append(entry('b', 2))
    await removeOne('a')
    const all = await listAll()
    expect(all.map(e => e.id)).toEqual(['b'])
  })

  it('clearAll empties the store', async () => {
    await append(entry('a', 1))
    await append(entry('b', 2))
    await clearAll()
    expect(await listAll()).toEqual([])
  })
})
