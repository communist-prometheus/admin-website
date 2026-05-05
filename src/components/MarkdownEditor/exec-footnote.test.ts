import { describe, expect, it } from 'vitest'
import { nextFootnoteId } from './exec-footnote'

describe('nextFootnoteId', () => {
  it('returns 1 for an empty body', () => {
    expect(nextFootnoteId('')).toBe(1)
  })

  it('returns 1 when no footnotes exist', () => {
    expect(nextFootnoteId('lorem ipsum dolor sit')).toBe(1)
  })

  it('returns max + 1 when markers exist in the text', () => {
    expect(nextFootnoteId('a [^1] b [^2] c [^5] d')).toBe(6)
  })

  it('reads ids out of definition lines too', () => {
    expect(nextFootnoteId('text [^3]\n\n[^3]: definition')).toBe(4)
  })

  it('skips non-numeric ids without crashing', () => {
    /*
     * GFM allows word ids like `[^big-quote]` — they shouldn't
     * raise the integer counter, only numeric markers do.
     */
    expect(nextFootnoteId('a [^manifest] b [^7] c')).toBe(8)
  })
})
