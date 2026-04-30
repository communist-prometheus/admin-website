import { afterEach, describe, expect, it } from 'vitest'
import type { SpanRecord } from './otlp-types'
import { append, MAX_BUFFER, replay, resetBuffer } from './sse-buffer'

const span = (id: string): SpanRecord => ({
  traceId: 't',
  spanId: id,
  parentSpanId: undefined,
  name: 'op',
  startedAt: 1,
  finishedAt: 2,
  status: 'ok',
  attributes: {},
})

describe('sse-buffer', () => {
  afterEach(() => {
    resetBuffer()
  })

  it('assigns monotonic ids starting at 1', () => {
    const a = append(span('a'))
    const b = append(span('b'))
    expect(a.id).toBe(1)
    expect(b.id).toBe(2)
  })

  it('replays only events newer than the cursor', () => {
    append(span('a'))
    append(span('b'))
    append(span('c'))
    const { events, gap } = replay(1)
    expect(events.map(e => e.span.spanId)).toEqual(['b', 'c'])
    expect(gap).toBe(false)
  })

  it('flags a gap when the cursor predates the buffer head', () => {
    Array.from({ length: MAX_BUFFER + 5 }).forEach((_, i) => {
      append(span(`s${i}`))
    })
    const { gap, oldestId } = replay(1)
    expect(gap).toBe(true)
    expect(oldestId).toBeGreaterThan(1)
  })

  it('caps the buffer at MAX_BUFFER entries', () => {
    Array.from({ length: MAX_BUFFER + 10 }).forEach((_, i) => {
      append(span(`s${i}`))
    })
    const { events } = replay(0)
    expect(events.length).toBe(MAX_BUFFER)
  })
})
