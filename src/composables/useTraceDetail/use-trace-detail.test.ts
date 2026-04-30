import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useTraceDetail } from './use-trace-detail'

const ok = (body: object): Response =>
  new Response(JSON.stringify(body), {
    status: 200,
    headers: { 'content-type': 'application/json' },
  })

const sample = {
  traceId: 't1',
  spans: [
    {
      traceId: 't1',
      spanId: 's1',
      parentSpanId: undefined,
      name: 'op',
      startedAt: 1,
      finishedAt: 2,
      status: 'ok',
      attributes: {},
    },
  ],
  logs: [],
}

describe('useTraceDetail', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(ok(sample)))
  })
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('loads + stores a trace detail body', async () => {
    const handle = useTraceDetail()
    await handle.load('t1')
    expect(handle.detail.value?.traceId).toBe('t1')
    expect(handle.detail.value?.spans).toHaveLength(1)
    expect(handle.error.value).toBeUndefined()
  })

  it('maps 403 to forbidden', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(new Response(null, { status: 403 }))
    )
    const handle = useTraceDetail()
    await handle.load('t1')
    expect(handle.error.value).toBe('forbidden')
    expect(handle.detail.value).toBeUndefined()
  })

  it('maps 404 to not-found', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(new Response(null, { status: 404 }))
    )
    const handle = useTraceDetail()
    await handle.load('t1')
    expect(handle.error.value).toBe('not-found')
  })

  it('clear empties the body', async () => {
    const handle = useTraceDetail()
    await handle.load('t1')
    handle.clear()
    expect(handle.detail.value).toBeUndefined()
    expect(handle.error.value).toBeUndefined()
  })
})
