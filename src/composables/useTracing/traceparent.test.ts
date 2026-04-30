import { describe, expect, it } from 'vitest'
import { childOf, newRootTraceparent, parse, serialise } from './traceparent'
import { TRACEPARENT_RE } from './traceparent-types'

describe('newRootTraceparent', () => {
  it('produces a string matching the W3C wire format', () => {
    const tp = newRootTraceparent()
    expect(serialise(tp)).toMatch(TRACEPARENT_RE)
  })

  it('produces distinct trace-ids on consecutive calls', () => {
    const a = newRootTraceparent()
    const b = newRootTraceparent()
    expect(a.traceId).not.toBe(b.traceId)
    expect(a.parentId).not.toBe(b.parentId)
  })

  it('honours the sampled flag', () => {
    expect(serialise(newRootTraceparent(true))).toMatch(/-01$/)
    expect(serialise(newRootTraceparent(false))).toMatch(/-00$/)
  })
})

describe('childOf', () => {
  it('keeps the trace-id and replaces the parent-id', () => {
    const root = newRootTraceparent()
    const child = childOf(root)
    expect(child.traceId).toBe(root.traceId)
    expect(child.parentId).not.toBe(root.parentId)
  })
})

describe('parse', () => {
  it('round-trips a serialised traceparent', () => {
    const root = newRootTraceparent()
    const back = parse(serialise(root))
    expect(back).toEqual(root)
  })

  it('returns undefined for malformed input', () => {
    expect(parse('garbage')).toBeUndefined()
    expect(parse('00-not-hex-thanks-01')).toBeUndefined()
    expect(parse('')).toBeUndefined()
  })

  it('rejects unsupported version bytes', () => {
    const tp = newRootTraceparent()
    const wire = serialise(tp).replace(/^00/, 'ff')
    expect(parse(wire)).toBeUndefined()
  })
})
