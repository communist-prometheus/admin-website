import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { RunLog } from '@/validation/schemas/run-log'
import {
  apiListRuns,
  apiListSubscriberRuns,
  RUNS_PAGE_SIZE,
} from './runs-api'

const sample: RunLog = {
  id: 1,
  subscriberId: 7,
  tickAt: '2026-06-06T09:00:00.000Z',
  articleCount: 3,
  status: 'sent',
  resendId: 're_42',
  error: undefined,
  email: 'reader@example.test',
}

const mockFetch = vi.fn()

beforeEach(() => {
  vi.stubGlobal('fetch', mockFetch)
})

afterEach(() => {
  vi.unstubAllGlobals()
  mockFetch.mockReset()
})

const ok = (body: unknown) =>
  new Response(JSON.stringify(body), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })

describe('apiListRuns', () => {
  it('asks for a full page by default and parses the list', async () => {
    mockFetch.mockResolvedValue(ok({ runs: [sample] }))
    const res = await apiListRuns()
    expect(mockFetch).toHaveBeenCalledOnce()
    const [url, init] = mockFetch.mock.calls[0] as [string, RequestInit]
    /*
     * The old default asked for 20 rows. One tick writes one row per
     * recipient, so 20 rows did not even cover a single run — which is
     * why the log looked almost empty.
     */
    expect(url.endsWith(`/api/runs?limit=${RUNS_PAGE_SIZE}&offset=0`)).toBe(
      true
    )
    expect(init.credentials).toBe('include')
    expect(res.runs).toHaveLength(1)
    expect(res.runs[0]?.email).toBe('reader@example.test')
  })

  it('pages back through history with limit + offset', async () => {
    mockFetch.mockResolvedValue(ok({ runs: [] }))
    await apiListRuns(50, 200)
    const [url] = mockFetch.mock.calls[0] as [string, RequestInit]
    expect(url).toMatch(/\/api\/runs\?limit=50&offset=200$/)
  })

  it('fetches the send history of one address', async () => {
    mockFetch.mockResolvedValue(ok({ runs: [sample] }))
    const res = await apiListSubscriberRuns(7)
    const [url] = mockFetch.mock.calls[0] as [string, RequestInit]
    expect(url).toMatch(/\/api\/subscribers\/7\/runs$/)
    expect(res.runs[0]?.status).toBe('sent')
  })

  it('bubbles a readable error on non-2xx', async () => {
    mockFetch.mockResolvedValue(
      new Response(JSON.stringify({ error: 'forbidden' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      })
    )
    await expect(apiListRuns()).rejects.toThrow(/forbidden/)
  })
})
