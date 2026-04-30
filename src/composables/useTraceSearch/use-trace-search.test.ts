import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useTraceSearch } from './use-trace-search'

const okBody = (
  traces: ReadonlyArray<unknown>,
  nextCursor: number | undefined = undefined
): Response =>
  new Response(JSON.stringify({ traces, nextCursor }), {
    status: 200,
    headers: { 'content-type': 'application/json' },
  })

const fakeTrace = {
  traceId: 't1',
  rootSpanId: 's1',
  rootName: 'op',
  status: 'ok',
  startedAt: 100,
  spanCount: 3,
  durationMs: 50,
}

describe('useTraceSearch', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(okBody([fakeTrace])))
  })
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('runs a search and stores the results', async () => {
    const search = useTraceSearch()
    await search.run()
    expect(search.traces.value).toHaveLength(1)
    expect(search.traces.value[0]?.traceId).toBe('t1')
  })

  it('appends results when loadMore follows a cursor', async () => {
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValueOnce(okBody([fakeTrace], 100))
        .mockResolvedValueOnce(okBody([{ ...fakeTrace, traceId: 't2' }]))
    )
    const search = useTraceSearch()
    await search.run()
    expect(search.nextCursor.value).toBe(100)
    await search.loadMore()
    expect(search.traces.value.map(t => t.traceId)).toEqual(['t1', 't2'])
  })

  it('reset clears traces, filters, and cursor', async () => {
    const search = useTraceSearch()
    await search.run()
    search.reset()
    expect(search.traces.value).toEqual([])
    expect(search.nextCursor.value).toBeUndefined()
    expect(search.filters.value.q).toBe('')
  })

  it('flags an error when the request fails', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(new Response(null, { status: 500 }))
    )
    const search = useTraceSearch()
    await search.run()
    expect(search.error.value).toBe(true)
    expect(search.traces.value).toEqual([])
  })
})
