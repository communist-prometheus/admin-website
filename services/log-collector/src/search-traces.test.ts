import { describe, expect, it, vi } from 'vitest'
import { parseSearchQuery } from './search-query'
import { searchTraces } from './search-traces'
import type { StorageBindings } from './storage-types'

const fakeRow = {
  trace_id: 't1',
  root_span_id: 's1',
  root_name: 'op',
  root_status: 'ok',
  started_at: 1000,
  span_count: 5,
  duration_ms: 250,
}

const buildBindings = (rows: ReadonlyArray<Record<string, unknown>>) => {
  const all = vi.fn().mockResolvedValue({ results: rows, success: true })
  const run = vi.fn().mockResolvedValue({ success: true })
  const bind = vi.fn()
  const stmt = { bind, all, run }
  bind.mockReturnValue(stmt)
  const prepare = vi.fn().mockReturnValue(stmt)
  const bindings: StorageBindings = {
    ANALYTICS_DATASET: undefined,
    D1: { prepare },
  }
  return { bindings, spies: { prepare, bind, all } }
}

const emptyBindings: StorageBindings = {
  ANALYTICS_DATASET: undefined,
  D1: undefined,
}

describe('searchTraces', () => {
  it('returns an empty response when D1 is absent', async () => {
    const out = await searchTraces(
      emptyBindings,
      parseSearchQuery(new URLSearchParams())
    )
    expect(out.traces).toEqual([])
    expect(out.nextCursor).toBeUndefined()
  })

  it('shapes D1 rows into camel-cased summaries', async () => {
    const { bindings, spies } = buildBindings([fakeRow])
    const out = await searchTraces(
      bindings,
      parseSearchQuery(new URLSearchParams())
    )
    expect(out.traces).toHaveLength(1)
    expect(out.traces[0]?.traceId).toBe('t1')
    expect(out.traces[0]?.rootSpanId).toBe('s1')
    expect(out.traces[0]?.spanCount).toBe(5)
    expect(out.traces[0]?.durationMs).toBe(250)
    expect(spies.prepare).toHaveBeenCalledOnce()
  })

  it('emits a nextCursor when the page is full', async () => {
    const url = new URLSearchParams()
    url.set('limit', '1')
    const { bindings } = buildBindings([fakeRow])
    const out = await searchTraces(bindings, parseSearchQuery(url))
    expect(out.nextCursor).toBe(1000)
  })

  it('omits nextCursor when the page is partial', async () => {
    const url = new URLSearchParams()
    url.set('limit', '50')
    const { bindings } = buildBindings([fakeRow])
    const out = await searchTraces(bindings, parseSearchQuery(url))
    expect(out.nextCursor).toBeUndefined()
  })

  it('passes org filter through to the bind list', async () => {
    const url = new URLSearchParams()
    url.set('org', 'communist-prometheus')
    const { bindings, spies } = buildBindings([])
    await searchTraces(bindings, parseSearchQuery(url))
    expect(spies.bind).toHaveBeenCalledWith('communist-prometheus', 50)
  })
})
