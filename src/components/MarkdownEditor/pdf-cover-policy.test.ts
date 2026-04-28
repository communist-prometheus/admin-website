import { describe, expect, it } from 'vitest'
import { shouldAutoSetCover } from './pdf-cover-policy'

describe('shouldAutoSetCover', () => {
  it('auto-sets when there is no cover yet', () => {
    expect(shouldAutoSetCover(undefined)).toBe(true)
  })

  it('auto-sets when cover string is empty', () => {
    expect(shouldAutoSetCover('')).toBe(true)
  })

  it('preserves existing cover when one is set manually', () => {
    expect(shouldAutoSetCover('manual.png')).toBe(false)
  })

  it('preserves existing cover even when same as auto-default name', () => {
    // If editor previously kept the auto cover.png, keep it — the
    // policy is "user chose a cover" regardless of which file.
    expect(shouldAutoSetCover('cover.png')).toBe(false)
  })
})
