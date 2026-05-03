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
      'text XXFOOTNOTEREFXX1XX more XXFOOTNOTEREFXX2XX',
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
      'XXFOOTNOTEREFXX3XX and again XXFOOTNOTEREFXX3XX',
      [{ id: 3, html: 'thrice' }],
      toMd
    )
    expect(out).toBe('[^3] and again [^3]\n\n[^3]: thrice')
  })

  it('returns the body unchanged when there are no footnotes', () => {
    expect(assembleWithFootnotes('hello', [], toMd)).toBe('hello')
  })

  it('strips orphan placeholders when no definition exists', () => {
    const out = assembleWithFootnotes('word XXFOOTNOTEREFXX9XX end', [], toMd)
    expect(out).toBe('word  end')
  })

  it('keeps footnote bodies on a single line', () => {
    const out = assembleWithFootnotes(
      'XXFOOTNOTEREFXX1XX',
      [{ id: 1, html: '<p>line one</p><p>line two</p>' }],
      toMd
    )
    expect(out).toBe('[^1]\n\n[^1]: line one line two')
  })

  it('renders markdown inside footnote bodies (em + link)', () => {
    const out = assembleWithFootnotes(
      'XXFOOTNOTEREFXX4XX',
      [{ id: 4, html: 'see <em>ref</em> at <a href="http://x">x</a>' }],
      toMd
    )
    expect(out).toBe('[^4]\n\n[^4]: see *ref* at [x](http://x)')
  })

  it('strips legacy underscore placeholders (raw + turndown-escaped)', () => {
    /*
     * Earlier importer version emitted `@@FOOTNOTE_REF_N@@`.
     * Turndown escapes `_` to `\_`, producing
     * `@@FOOTNOTE\_REF\_N@@` in markdown — that escaped form
     * silently bypassed the strip regex and leaked into saved
     * files, forcing the editor to clean by hand. This test pins
     * the back-compat path so a re-save of an old article wipes
     * both shapes.
     */
    const raw = assembleWithFootnotes('a @@FOOTNOTE_REF_1@@ b', [], toMd)
    expect(raw).toBe('a  b')
    const escaped = assembleWithFootnotes(
      'c @@FOOTNOTE\\_REF\\_2@@ d',
      [],
      toMd
    )
    expect(escaped).toBe('c  d')
  })
})
