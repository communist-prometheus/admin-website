import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  bufferedSpanCount,
  flushNow,
  recordSpan,
  resetExporter,
} from './exporter'
import { FLUSH_AT_MS, FLUSH_AT_SPANS } from './exporter-config'
import type { Span } from './span-types'

const span = (id: string): Span => ({
  id,
  traceId: 't1',
  parentId: undefined,
  name: id,
  startedAt: 1,
  finishedAt: 2,
  attributes: {},
  status: 'ok',
})

describe('exporter', () => {
  beforeEach(() => {
    resetExporter()
    vi.useFakeTimers()
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(new Response(null, { status: 200 }))
    )
  })
  afterEach(() => {
    vi.useRealTimers()
    vi.unstubAllGlobals()
    resetExporter()
  })

  it('flushes immediately at FLUSH_AT_SPANS', async () => {
    for (let i = 0; i < FLUSH_AT_SPANS; i += 1) {
      recordSpan(span(`s${i}`))
    }
    await vi.runAllTimersAsync()
    expect(bufferedSpanCount()).toBe(0)
    expect(globalThis.fetch).toHaveBeenCalledTimes(1)
  })

  it('flushes after FLUSH_AT_MS when below the size trigger', async () => {
    recordSpan(span('a'))
    expect(bufferedSpanCount()).toBe(1)
    await vi.advanceTimersByTimeAsync(FLUSH_AT_MS - 1)
    expect(globalThis.fetch).not.toHaveBeenCalled()
    await vi.advanceTimersByTimeAsync(2)
    expect(globalThis.fetch).toHaveBeenCalledTimes(1)
  })

  it('retains spans on failed flush', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(new Response(null, { status: 500 }))
    )
    recordSpan(span('a'))
    recordSpan(span('b'))
    const result = await flushNow()
    expect(result.kind).toBe('fail')
    expect(bufferedSpanCount()).toBe(2)
  })

  it('returns idle when nothing buffered', async () => {
    expect((await flushNow()).kind).toBe('idle')
  })
})
