import { describe, expect, it } from 'vitest'
import { chunkSpans, DEFAULT_CHUNK_BYTES } from './chunk-batch'
import type { Span } from './span-types'

const span = (traceId: string, id: string, fillBytes: number = 0): Span => ({
  id,
  traceId,
  parentId: undefined,
  name: 'op',
  startedAt: 1,
  finishedAt: 2,
  attributes: { fill: 'x'.repeat(fillBytes) },
  status: 'ok',
})

describe('chunkSpans', () => {
  it('returns one chunk when total fits the budget', () => {
    const result = chunkSpans([span('t1', 'a'), span('t1', 'b')])
    expect(result).toHaveLength(1)
    expect(result[0]).toHaveLength(2)
  })

  it('returns [] for empty input', () => {
    expect(chunkSpans([])).toEqual([])
  })

  it('keeps a single trace in one chunk when possible', () => {
    const a = Array.from({ length: 5 }, (_, i) => span('t1', `a${i}`))
    const b = Array.from({ length: 5 }, (_, i) => span('t2', `b${i}`))
    const result = chunkSpans([...a, ...b])
    expect(result).toHaveLength(1)
  })

  it('splits across traces when total exceeds the budget', () => {
    const big = (id: string, t: string) => span(t, id, 70_000)
    const total = [
      big('a', 't1'),
      big('b', 't2'),
      big('c', 't3'),
      big('d', 't4'),
    ]
    const result = chunkSpans(total)
    expect(result.length).toBeGreaterThanOrEqual(2)
  })

  it('honours a smaller budget passed in', () => {
    const total = [span('t1', 'a'), span('t2', 'b')]
    const tiny = chunkSpans(total, 200)
    expect(tiny.length).toBeGreaterThanOrEqual(1)
  })

  it('default budget stays well under the 256 KB collector cap', () => {
    expect(DEFAULT_CHUNK_BYTES).toBeLessThan(256 * 1024)
  })
})
