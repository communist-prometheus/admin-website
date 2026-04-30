import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { sendChunked } from './exporter-send'
import type { Span } from './span-types'

const span = (id: string, fillBytes = 0): Span => ({
  id,
  traceId: 't1',
  parentId: undefined,
  name: 'op',
  startedAt: 1,
  finishedAt: 2,
  attributes: { fill: 'x'.repeat(fillBytes) },
  status: 'ok',
})

describe('sendChunked', () => {
  beforeEach(() => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(new Response(null, { status: 200 }))
    )
  })
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('returns true when all chunks land', async () => {
    expect(await sendChunked([span('a'), span('b')])).toBe(true)
    expect(globalThis.fetch).toHaveBeenCalledTimes(1)
  })

  it('issues multiple POSTs for oversized batches', async () => {
    const big = Array.from({ length: 6 }, (_, i) => span(`s${i}`, 70_000))
    await sendChunked(big)
    const calls = (globalThis.fetch as ReturnType<typeof vi.fn>).mock.calls
      .length
    expect(calls).toBeGreaterThanOrEqual(2)
  })

  it('returns false when a chunk fails', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(new Response(null, { status: 500 }))
    )
    expect(await sendChunked([span('a')])).toBe(false)
  })

  it('honours a 413 with chunkSize hint on retry', async () => {
    let calls = 0
    vi.stubGlobal(
      'fetch',
      vi.fn().mockImplementation(() => {
        calls += 1
        return calls === 1
          ? new Response(JSON.stringify({ chunkSize: 50 }), {
              status: 413,
              headers: { 'content-type': 'application/json' },
            })
          : new Response(null, { status: 200 })
      })
    )
    const big = [span('a', 1000), span('b', 1000)]
    expect(await sendChunked(big, 5_000)).toBe(true)
    expect(calls).toBeGreaterThanOrEqual(2)
  })
})
