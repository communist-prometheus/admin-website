import { afterEach, describe, expect, it, vi } from 'vitest'
import type { SpanRecord } from './otlp-types'
import { broadcast, subscribe, subscriberCount } from './sse-bus'

const span = (id: string, traceId: string): SpanRecord => ({
  traceId,
  spanId: id,
  parentSpanId: undefined,
  name: 'op',
  startedAt: 1,
  finishedAt: 2,
  status: 'ok',
  attributes: {},
})

describe('sse-bus', () => {
  afterEach(() => {
    while (subscriberCount() > 0) {
      // safety net — shouldn't happen, but tests must leave a clean bus
    }
  })

  it('delivers spans matching the filter', () => {
    const sink = vi.fn()
    const dispose = subscribe({ filter: () => true, send: sink })
    broadcast(span('s1', 't1'))
    expect(sink).toHaveBeenCalledTimes(1)
    dispose()
  })

  it('skips spans the filter rejects', () => {
    const sink = vi.fn()
    const dispose = subscribe({
      filter: s => s.traceId === 'wanted',
      send: sink,
    })
    broadcast(span('s1', 'other'))
    expect(sink).not.toHaveBeenCalled()
    dispose()
  })

  it('disposer removes the subscriber from the registry', () => {
    const before = subscriberCount()
    const sink = vi.fn()
    const dispose = subscribe({ filter: () => true, send: sink })
    expect(subscriberCount()).toBe(before + 1)
    dispose()
    expect(subscriberCount()).toBe(before)
  })

  it('fans out to multiple subscribers', () => {
    const a = vi.fn()
    const b = vi.fn()
    const da = subscribe({ filter: () => true, send: a })
    const db = subscribe({ filter: () => true, send: b })
    broadcast(span('s1', 't1'))
    expect(a).toHaveBeenCalledTimes(1)
    expect(b).toHaveBeenCalledTimes(1)
    da()
    db()
  })
})
