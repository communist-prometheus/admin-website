import { afterEach, describe, expect, it, vi } from 'vitest'
import { buildInsertableMediaTag } from './insertable-media'

const mockPrompt = (returns: string | null) =>
  vi.spyOn(globalThis, 'prompt').mockImplementation(() => returns)

describe('buildInsertableMediaTag', () => {
  afterEach(() => vi.restoreAllMocks())

  it('uses the prompted alt text for images', () => {
    mockPrompt('A red square')
    const out = buildInsertableMediaTag('hero.png', 'image/png')
    expect(out).toBe('![A red square](./assets/hero.png)')
  })

  it('returns undefined when the editor cancels the prompt', () => {
    mockPrompt(null)
    const out = buildInsertableMediaTag('hero.png', 'image/png')
    expect(out).toBeUndefined()
  })

  it('returns undefined when the prompt is empty', () => {
    mockPrompt('   ')
    const out = buildInsertableMediaTag('hero.png', 'image/png')
    expect(out).toBeUndefined()
  })

  it('does not prompt for non-image media (uses filename as label)', () => {
    const spy = mockPrompt(null)
    const out = buildInsertableMediaTag('clip.mp4', 'video/mp4')
    expect(spy).not.toHaveBeenCalled()
    expect(out).toContain('<video controls>')
  })

  it('does not prompt for documents', () => {
    const spy = mockPrompt(null)
    const out = buildInsertableMediaTag('spec.pdf', 'application/pdf')
    expect(spy).not.toHaveBeenCalled()
    expect(out).toBe('[spec.pdf](./assets/spec.pdf)')
  })
})
