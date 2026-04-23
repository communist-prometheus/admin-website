import { describe, expect, it } from 'vitest'
import { assembleWithFootnotes } from './assemble-footnotes'

const toMd = (html: string): string => {
  // Minimal stand-in for the turndown conversion in tests.
  return html
    .replace(/<em>([^<]+)<\/em>/g, '*$1*')
    .replace(/<a[^>]*href="([^"]+)"[^>]*>([^<]+)<\/a>/g, '[$2]($1)')
    .replace(/<\/p>\s*<p>/g, '\n\n')
    .replace(/<[^>]+>/g, '')
    .trim()
}

describe('assembleWithFootnotes', () => {
  it('swaps placeholders with [^N] and appends definitions', () => {
    const out = assembleWithFootnotes(
      'text @@FOOTNOTE_REF_1@@ more @@FOOTNOTE_REF_2@@',
      [
        { id: 1, html: 'one' },
        { id: 2, html: 'two' },
      ],
      toMd
    )
    expect(out).toBe('text [^1] more [^2]\n\n[^1]: one\n[^2]: two')
  })

  it('emits only one definition when the same footnote is referenced twice', () => {
    const out = assembleWithFootnotes(
      '@@FOOTNOTE_REF_3@@ and again @@FOOTNOTE_REF_3@@',
      [{ id: 3, html: 'thrice' }],
      toMd
    )
    expect(out).toBe('[^3] and again [^3]\n\n[^3]: thrice')
  })

  it('returns the body unchanged when there are no footnotes', () => {
    expect(assembleWithFootnotes('hello', [], toMd)).toBe('hello')
  })

  it('strips orphan placeholders when no definition exists', () => {
    const out = assembleWithFootnotes('word @@FOOTNOTE_REF_9@@ end', [], toMd)
    expect(out).toBe('word  end')
  })

  it('keeps footnote bodies on a single line', () => {
    const out = assembleWithFootnotes(
      '@@FOOTNOTE_REF_1@@',
      [{ id: 1, html: '<p>line one</p><p>line two</p>' }],
      toMd
    )
    expect(out).toBe('[^1]\n\n[^1]: line one line two')
  })

  it('renders markdown inside footnote bodies (em + link)', () => {
    const out = assembleWithFootnotes(
      '@@FOOTNOTE_REF_4@@',
      [{ id: 4, html: 'see <em>ref</em> at <a href="http://x">x</a>' }],
      toMd
    )
    expect(out).toBe('[^4]\n\n[^4]: see *ref* at [x](http://x)')
  })
})
