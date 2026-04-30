import { afterEach, describe, expect, it } from 'vitest'
import { clearSpans, startSpan } from '@/composables/useTracing/spans-store'
import { stampTraceparent } from './stamp-traceparent'

describe('stampTraceparent', () => {
  afterEach(() => {
    clearSpans()
  })

  it('returns the message untouched when no span is active', () => {
    const out = stampTraceparent({ type: 'SW_STATUS' })
    expect(out).toEqual({ type: 'SW_STATUS' })
  })

  it('stamps a W3C traceparent from the active span', () => {
    const span = startSpan('client.op')
    const out = stampTraceparent({ type: 'SW_STATUS' })
    expect(out.traceparent).toMatch(
      new RegExp(`^00-${span.traceId}-${span.id}-01$`)
    )
  })
})
