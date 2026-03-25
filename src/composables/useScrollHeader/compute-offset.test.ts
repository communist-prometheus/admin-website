import { describe, expect, it } from 'vitest'
import { computeOffset } from './compute-offset'

describe('computeOffset', () => {
  const H = 60

  it('returns 0 when at top', () => {
    expect(computeOffset(0, 0, 0, H)).toBe(0)
  })

  it('tracks scroll down 1:1', () => {
    expect(computeOffset(0, 10, 0, H)).toBe(-10)
  })

  it('clamps at negative header height', () => {
    expect(computeOffset(0, 100, 0, H)).toBe(-H)
  })

  it('tracks scroll up 1:1', () => {
    expect(computeOffset(100, 90, -H, H)).toBe(-50)
  })

  it('clamps at zero on full scroll up', () => {
    expect(computeOffset(50, 0, -20, H)).toBe(0)
  })

  it('stays hidden during continued scroll down', () => {
    expect(computeOffset(200, 300, -H, H)).toBe(-H)
  })
})
