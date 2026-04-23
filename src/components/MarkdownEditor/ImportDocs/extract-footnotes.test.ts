import { describe, expect, it } from 'vitest'
import { extractFootnotes } from './extract-footnotes'

const trailing = (...items: readonly string[]) =>
  `<hr><ol>${items.join('')}</ol>`

describe('extractFootnotes', () => {
  it('returns input unchanged when no footnotes are present', () => {
    const r = extractFootnotes('<p>body</p>')
    expect(r.html).toBe('<p>body</p>')
    expect(r.footnotes).toEqual([])
  })

  it('replaces <sup> reference with a placeholder', () => {
    const r = extractFootnotes(
      '<p>see<sup><a href="#footnote-1">[1]</a></sup></p>' +
        trailing(
          '<li id="footnote-1">body<a href="#footnote-ref-1">↑</a></li>'
        )
    )
    expect(r.html).toBe('<p>see@@FOOTNOTE_REF_1@@</p>')
    expect(r.footnotes).toEqual([{ id: 1, html: 'body' }])
  })

  it('strips the back-link from the footnote body', () => {
    const r = extractFootnotes(
      '<p>see<sup><a href="#endnote-3">[3]</a></sup></p>' +
        trailing(
          '<li id="endnote-3">see <em>reference</em> at <a href="http://x">x</a><a href="#endnote-ref-3">↑</a></li>'
        )
    )
    expect(r.footnotes[0]?.html).toBe(
      'see <em>reference</em> at <a href="http://x">x</a>'
    )
  })

  it('sorts footnote bodies by numeric id even when emitted out of order', () => {
    const r = extractFootnotes(
      '<p>a<sup><a href="#footnote-2">[2]</a></sup> b<sup><a href="#footnote-1">[1]</a></sup></p>' +
        trailing(
          '<li id="footnote-2">two<a href="#footnote-ref-2">↑</a></li>',
          '<li id="footnote-1">one<a href="#footnote-ref-1">↑</a></li>'
        )
    )
    expect(r.footnotes.map(f => f.id)).toEqual([1, 2])
  })

  it('leaves plain <sup> unaffected (not a mammoth ref)', () => {
    const r = extractFootnotes('<p>E=mc<sup>2</sup></p>')
    expect(r.html).toBe('<p>E=mc<sup>2</sup></p>')
    expect(r.footnotes).toEqual([])
  })

  it('handles multiple references to the same footnote', () => {
    const r = extractFootnotes(
      '<p>a<sup><a href="#footnote-1">[1]</a></sup> b<sup><a href="#footnote-1">[1]</a></sup></p>' +
        trailing(
          '<li id="footnote-1">one<a href="#footnote-ref-1">↑</a></li>'
        )
    )
    expect(r.html).toBe('<p>a@@FOOTNOTE_REF_1@@ b@@FOOTNOTE_REF_1@@</p>')
    expect(r.footnotes).toEqual([{ id: 1, html: 'one' }])
  })

  it('mixes footnote- and endnote- ids seamlessly', () => {
    const r = extractFootnotes(
      '<p>a<sup><a href="#footnote-1">[1]</a></sup> b<sup><a href="#endnote-2">[2]</a></sup></p>' +
        trailing(
          '<li id="footnote-1">f<a href="#footnote-ref-1">↑</a></li>',
          '<li id="endnote-2">e<a href="#endnote-ref-2">↑</a></li>'
        )
    )
    expect(r.footnotes.map(f => f.id)).toEqual([1, 2])
  })

  it('keeps sup ref when the trailing body is missing (malformed)', () => {
    const r = extractFootnotes(
      '<p>see<sup><a href="#footnote-9">[9]</a></sup></p>'
    )
    expect(r.html).toBe('<p>see@@FOOTNOTE_REF_9@@</p>')
    expect(r.footnotes).toEqual([])
  })
})
