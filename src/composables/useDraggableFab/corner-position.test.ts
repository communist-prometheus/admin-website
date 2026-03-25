import { describe, expect, it } from 'vitest'
import { cornerPosition } from './corner-position'

describe('cornerPosition', () => {
  const S = 56
  const M = 16
  const VW = 390
  const VH = 844

  it('places bottom-right correctly', () => {
    const p = cornerPosition('bottom-right', S, M, VW, VH)
    expect(p.x).toBe(VW - S - M)
    expect(p.y).toBe(VH - S - M)
  })

  it('places top-left at margin', () => {
    const p = cornerPosition('top-left', S, M, VW, VH)
    expect(p.x).toBe(M)
    expect(p.y).toBe(M)
  })

  it('places top-right correctly', () => {
    const p = cornerPosition('top-right', S, M, VW, VH)
    expect(p.x).toBe(VW - S - M)
    expect(p.y).toBe(M)
  })

  it('places bottom-left correctly', () => {
    const p = cornerPosition('bottom-left', S, M, VW, VH)
    expect(p.x).toBe(M)
    expect(p.y).toBe(VH - S - M)
  })
})
