import { describe, expect, it } from 'vitest'
import { isStickyKind } from './is-sticky-kind'

describe('isStickyKind', () => {
  it('treats failure-class kinds as sticky', () => {
    expect(isStickyKind('error')).toBe(true)
    expect(isStickyKind('conflict')).toBe(true)
    expect(isStickyKind('network')).toBe(true)
  })

  it('treats informational kinds as transient', () => {
    expect(isStickyKind('info')).toBe(false)
    expect(isStickyKind('warn')).toBe(false)
  })
})
