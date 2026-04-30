import { describe, expect, it } from 'vitest'
import { extractMeta, looksLikeLead, looksLikeTitle } from './extract-meta'

describe('looksLikeTitle', () => {
  it('accepts a short whole-bold paragraph', () => {
    expect(looksLikeTitle('<p><strong>Some Title</strong></p>')).toBe(true)
  })
  it('rejects sentence-terminated paragraphs', () => {
    expect(
      looksLikeTitle('<p><strong>This is a sentence.</strong></p>')
    ).toBe(false)
  })
  it('rejects non-bold paragraphs', () => {
    expect(looksLikeTitle('<p>Some Title</p>')).toBe(false)
  })
})

describe('looksLikeLead', () => {
  it('accepts long bold-italic paragraphs', () => {
    const long = 'A'.repeat(120)
    expect(looksLikeLead(`<p><strong><em>${long}</em></strong></p>`)).toBe(
      true
    )
  })
  it('rejects short bold-italic paragraphs (likely a section prefix)', () => {
    expect(looksLikeLead('<p><strong><em>Section</em></strong></p>')).toBe(
      false
    )
  })
  it('rejects whole-bold-only paragraphs', () => {
    expect(looksLikeLead('<p><strong>Just bold</strong></p>')).toBe(false)
  })
})

describe('extractMeta', () => {
  it('extracts title and lead description from a Prometheus-shaped doc', () => {
    const html =
      '<p><strong><em>Section prefix</em></strong></p>' +
      '<p><strong>The Title</strong></p>' +
      `<p><strong><em>${'A'.repeat(120)}</em></strong></p>` +
      '<p>Body content here.</p>'
    const meta = extractMeta(html)
    expect(meta.title).toBe('The Title')
    expect(meta.description.length).toBeGreaterThan(80)
    expect(meta.bodyHtml).not.toContain('The Title')
    expect(meta.bodyHtml).not.toContain('A'.repeat(120))
    expect(meta.bodyHtml).toContain('Section prefix')
    expect(meta.bodyHtml).toContain('Body content here.')
  })

  it('falls back to first body paragraph when no bold-italic lead exists', () => {
    const html =
      '<p><strong>Title</strong></p>' +
      '<p>This is a long enough first paragraph to serve as a description.</p>' +
      '<p><strong>Section</strong></p>' +
      '<p>More content.</p>'
    const meta = extractMeta(html)
    expect(meta.title).toBe('Title')
    expect(meta.description).toContain('This is a long enough first')
    expect(meta.bodyHtml).toContain(
      '<p>This is a long enough first paragraph to serve as a description.</p>'
    )
    expect(meta.bodyHtml).not.toContain('<p><strong>Title</strong></p>')
  })

  it('returns empty title when document has no bold paragraph', () => {
    const meta = extractMeta('<p>Plain text only.</p>')
    expect(meta.title).toBe('')
    expect(meta.bodyHtml).toContain('Plain text')
  })

  it('picks up the lead even when it precedes the title', () => {
    const lead = `<p><strong><em>${'L'.repeat(120)}</em></strong></p>`
    const html = `${lead}<p><strong>Title</strong></p><p>Body content here.</p>`
    const meta = extractMeta(html)
    expect(meta.title).toBe('Title')
    expect(meta.description.startsWith('LLLL')).toBe(true)
    expect(meta.bodyHtml).not.toContain(lead)
    expect(meta.bodyHtml).not.toContain('<p><strong>Title</strong></p>')
  })

  it('caps description length even when the bold-italic lead is huge', () => {
    const lead = `<p><strong><em>${'X'.repeat(800)}</em></strong></p>`
    const html = `${lead}<p><strong>Title</strong></p><p>Body.</p>`
    const meta = extractMeta(html)
    expect(meta.description.length).toBeLessThanOrEqual(300)
    expect(meta.description.endsWith('…')).toBe(true)
  })

  it('skips short bold-italic prefixes before the title to find the real lead', () => {
    const lead = `<p><strong><em>${'L'.repeat(150)}</em></strong></p>`
    const sectionPrefix = '<p><strong><em>Short Section</em></strong></p>'
    const html =
      lead +
      sectionPrefix +
      '<p><strong>Real Title</strong></p>' +
      '<p>Body.</p>' +
      `<p><strong><em>${'Q'.repeat(120)}</em></strong></p>`
    const meta = extractMeta(html)
    expect(meta.title).toBe('Real Title')
    expect(meta.description.startsWith('LLLL')).toBe(true)
    // The unrelated bold-italic quote later in the doc must not be picked:
    expect(meta.description).not.toContain('QQQ')
  })

  it('handles a bold-italic lead with mid-paragraph italics interrupted', () => {
    const lead = `<p><strong><em>${'A'.repeat(60)}</em>«broken»<em>${'B'.repeat(60)}</em></strong></p>`
    const html = `${lead}<p><strong>Real Title</strong></p><p>Body.</p>`
    const meta = extractMeta(html)
    expect(meta.title).toBe('Real Title')
    expect(meta.description).toContain('AAAA')
    expect(meta.description).toContain('«broken»')
    expect(meta.description).toContain('BBBB')
  })
})
