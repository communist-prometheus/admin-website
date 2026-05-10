import { describe, expect, it } from 'vitest'
import { shouldAutoSetCover } from './pdf-cover-policy'

describe('shouldAutoSetCover', () => {
  it('auto-sets when there is no cover yet', () => {
    expect(shouldAutoSetCover(undefined)).toBe(true)
  })

  it('auto-sets when cover string is empty', () => {
    expect(shouldAutoSetCover('')).toBe(true)
  })

  it('preserves a manually picked cover', () => {
    expect(shouldAutoSetCover('manual.png')).toBe(false)
    expect(shouldAutoSetCover('./assets/special-photo.jpg')).toBe(false)
    expect(shouldAutoSetCover('./assets/hero.png')).toBe(false)
  })

  it('overwrites a legacy auto cover.png — needed so re-uploading a PDF for a lang that inherited the legacy single-cover repoints to the new per-lang cover', () => {
    expect(shouldAutoSetCover('cover.png')).toBe(true)
    expect(shouldAutoSetCover('./assets/cover.png')).toBe(true)
  })

  it('overwrites a per-lang auto cover.<lang>.png', () => {
    expect(shouldAutoSetCover('cover.en.png')).toBe(true)
    expect(shouldAutoSetCover('./assets/cover.ru.png')).toBe(true)
    expect(shouldAutoSetCover('./assets/cover.it.png')).toBe(true)
  })
})
