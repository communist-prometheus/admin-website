import { describe, expect, it } from 'vitest'
import type { Span } from '@/composables/useTracing'
import { groupByTrace } from './group-by-trace'

const span = (traceId: string, id: string, startedAt: number): Span => ({
  id,
  traceId,
  parentId: undefined,
  name: id,
  startedAt,
  finishedAt: startedAt + 1,
  attributes: {},
  status: 'ok',
})

describe('groupByTrace', () => {
  it('returns each trace as its own group', () => {
    const groups = groupByTrace([span('t1', 'a', 100), span('t2', 'b', 200)])
    expect(groups.map(g => g.traceId)).toEqual(['t2', 't1'])
  })

  it('sorts spans within a trace oldest-first', () => {
    const groups = groupByTrace([
      span('t1', 'late', 200),
      span('t1', 'early', 100),
    ])
    expect(groups[0]?.spans.map(s => s.id)).toEqual(['early', 'late'])
  })

  it('sorts traces newest-first by their first span', () => {
    const groups = groupByTrace([span('old', 'a', 50), span('new', 'b', 500)])
    expect(groups.map(g => g.traceId)).toEqual(['new', 'old'])
  })

  it('returns an empty list for empty input', () => {
    expect(groupByTrace([])).toEqual([])
  })
})
