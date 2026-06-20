import { describe, expect, it } from 'vitest'
import type { Subscriber } from '@/stores/comms'
import { countByStatus, filterByStatus } from './status-counts'

const sub = (id: number, status: Subscriber['status']): Subscriber => ({
  id,
  email: `u${id}@x.test`,
  langs: ['en'],
  messageLang: 'en',
  status,
  createdAt: '2026-06-03T00:00:00.000Z',
  lastSentAt: undefined,
  unsubscribedAt: undefined,
})

const ROWS: readonly Subscriber[] = [
  sub(1, 'active'),
  sub(2, 'active'),
  sub(3, 'unsubscribed'),
  sub(4, 'bounced'),
]

describe('countByStatus', () => {
  it('tallies each lifecycle status', () => {
    expect(countByStatus(ROWS)).toEqual({
      active: 2,
      unsubscribed: 1,
      bounced: 1,
      complained: 0,
    })
  })

  it('returns all zeros for an empty list', () => {
    expect(countByStatus([])).toEqual({
      active: 0,
      unsubscribed: 0,
      bounced: 0,
      complained: 0,
    })
  })
})

describe('filterByStatus', () => {
  it('passes every row through for "all"', () => {
    expect(filterByStatus(ROWS, 'all')).toHaveLength(4)
  })

  it('keeps only the matching status', () => {
    expect(filterByStatus(ROWS, 'active').map(s => s.id)).toEqual([1, 2])
    expect(filterByStatus(ROWS, 'bounced').map(s => s.id)).toEqual([4])
    expect(filterByStatus(ROWS, 'complained')).toHaveLength(0)
  })
})
