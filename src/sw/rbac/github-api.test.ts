import { afterEach, describe, expect, it } from 'vitest'
import { setActiveContext } from '../tracing/active-context'
import { ghHeaders } from './github-api'

describe('ghHeaders', () => {
  afterEach(() => {
    setActiveContext(undefined)
  })

  it('omits traceparent when no SW context is active', () => {
    const h = ghHeaders('tok')
    expect(h['traceparent']).toBeUndefined()
  })

  it('emits W3C traceparent from the active SW context', () => {
    setActiveContext({ traceId: 'a'.repeat(32), spanId: 'b'.repeat(16) })
    const h = ghHeaders('tok')
    expect(h['traceparent']).toBe(`00-${'a'.repeat(32)}-${'b'.repeat(16)}-01`)
  })

  it('keeps the bearer + accept headers intact', () => {
    setActiveContext({ traceId: 'c'.repeat(32), spanId: 'd'.repeat(16) })
    const h = ghHeaders('tok')
    expect(h['authorization']).toBe('Bearer tok')
    expect(h['accept']).toBe('application/vnd.github+json')
  })
})
