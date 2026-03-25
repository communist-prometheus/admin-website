import { describe, expect, it } from 'vitest'
import { snapToCorner } from './snap-to-corner'

describe('snapToCorner', () => {
  it('snaps to bottom-right', () => {
    expect(snapToCorner(350, 700, 390, 844)).toBe('bottom-right')
  })

  it('snaps to top-left', () => {
    expect(snapToCorner(50, 100, 390, 844)).toBe('top-left')
  })

  it('snaps to top-right', () => {
    expect(snapToCorner(300, 100, 390, 844)).toBe('top-right')
  })

  it('snaps to bottom-left', () => {
    expect(snapToCorner(50, 700, 390, 844)).toBe('bottom-left')
  })
})
