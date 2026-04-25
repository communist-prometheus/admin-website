import { describe, expect, it } from 'vitest'
import { promoteNumberedListHeadings } from './promote-numbered-list-headings'

describe('promoteNumberedListHeadings', () => {
  it('promotes a single-item bold-only ordered list to h2 with N=1', () => {
    expect(
      promoteNumberedListHeadings(
        '<ol><li><strong>Section A</strong></li></ol><p>body</p>'
      )
    ).toBe('<h2>1. Section A</h2><p>body</p>')
  })

  it('numbers consecutive promotions sequentially across the doc', () => {
    const out = promoteNumberedListHeadings(
      '<ol><li><strong>One</strong></li></ol>' +
        '<p>body</p>' +
        '<ol><li><strong>Two</strong></li></ol>' +
        '<p>body</p>' +
        '<ol><li><strong>Three</strong></li></ol>'
    )
    expect(out).toBe(
      '<h2>1. One</h2><p>body</p><h2>2. Two</h2><p>body</p><h2>3. Three</h2>'
    )
  })

  it('trims surrounding whitespace inside <strong>', () => {
    expect(
      promoteNumberedListHeadings(
        '<ol><li><strong>  Title  </strong></li></ol>'
      )
    ).toBe('<h2>1. Title</h2>')
  })

  it('leaves a multi-item ordered list alone', () => {
    const html = '<ol><li>One</li><li>Two</li></ol>'
    expect(promoteNumberedListHeadings(html)).toBe(html)
  })

  it('leaves a single non-bold list item alone', () => {
    const html = '<ol><li>Just text</li></ol>'
    expect(promoteNumberedListHeadings(html)).toBe(html)
  })

  it('leaves a single <li> with bold-plus-extra content alone', () => {
    const html = '<ol><li><strong>Bold</strong> extra</li></ol>'
    expect(promoteNumberedListHeadings(html)).toBe(html)
  })

  it('skips an empty bold list item', () => {
    const html = '<ol><li><strong></strong></li></ol>'
    expect(promoteNumberedListHeadings(html)).toBe(html)
  })

  it('mixes nicely with existing real h2 headings', () => {
    const out = promoteNumberedListHeadings(
      '<h2>Existing</h2><ol><li><strong>Promoted</strong></li></ol>'
    )
    expect(out).toBe('<h2>Existing</h2><h2>1. Promoted</h2>')
  })

  it('handles non-Latin text in the heading', () => {
    expect(
      promoteNumberedListHeadings(
        '<ol><li><strong>Предисловие</strong></li></ol>'
      )
    ).toBe('<h2>1. Предисловие</h2>')
  })
})
