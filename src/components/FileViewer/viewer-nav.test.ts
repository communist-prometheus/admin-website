import { describe, expect, it } from 'vitest'
import { clampIndex, isViewable, moveIndex, swipeStep } from './viewer-nav'

describe('isViewable', () => {
  it('accepts image types', () => {
    expect(isViewable('image/png')).toBe(true)
    expect(isViewable('image/svg+xml')).toBe(true)
  })

  it('rejects non-image types', () => {
    expect(isViewable('application/zip')).toBe(false)
    expect(isViewable('text/plain')).toBe(false)
    expect(isViewable('')).toBe(false)
  })
})

describe('clampIndex', () => {
  it('keeps an in-range index', () => {
    expect(clampIndex(2, 5)).toBe(2)
  })

  it('clamps below and above the range', () => {
    expect(clampIndex(-3, 5)).toBe(0)
    expect(clampIndex(9, 5)).toBe(4)
  })

  it('returns 0 for an empty list', () => {
    expect(clampIndex(3, 0)).toBe(0)
  })
})

describe('moveIndex', () => {
  it('advances and retreats within bounds', () => {
    expect(moveIndex(1, 1, 4)).toBe(2)
    expect(moveIndex(2, -1, 4)).toBe(1)
  })

  it('does not wrap past the ends', () => {
    expect(moveIndex(0, -1, 4)).toBe(0)
    expect(moveIndex(3, 1, 4)).toBe(3)
  })
})

describe('swipeStep', () => {
  it('advances on a left-swipe past threshold', () => {
    expect(swipeStep(-60, 50)).toBe(1)
  })

  it('retreats on a right-swipe past threshold', () => {
    expect(swipeStep(70, 50)).toBe(-1)
  })

  it('ignores deltas within the threshold', () => {
    expect(swipeStep(-20, 50)).toBe(0)
    expect(swipeStep(30, 50)).toBe(0)
  })
})
