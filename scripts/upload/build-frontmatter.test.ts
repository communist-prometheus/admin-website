import { describe, expect, it } from 'vitest'
import { renderFrontmatter, stripFootnoteRefs } from './build-frontmatter'

describe('stripFootnoteRefs', () => {
  it('removes placeholder markers and collapses whitespace', () => {
    const out = stripFootnoteRefs('Title @@FOOTNOTE_REF_1@@ continues')
    expect(out).toBe('Title continues')
  })
  it('passes plain strings through', () => {
    expect(stripFootnoteRefs('No refs here')).toBe('No refs here')
  })
})

describe('renderFrontmatter', () => {
  it('renders simple values without quoting', () => {
    const out = renderFrontmatter({ title: 'Hello', lang: 'ru' })
    expect(out).toContain('title: Hello')
    expect(out).toContain('lang: ru')
    expect(out.startsWith('---\n')).toBe(true)
    expect(out.endsWith('---\n\n')).toBe(true)
  })
  it('quotes values with colons', () => {
    const out = renderFrontmatter({
      title: 'A: Subtitle and More',
      lang: 'ru',
    })
    expect(out).toContain('title: "A: Subtitle and More"')
  })
  it('emits booleans without quotes', () => {
    const out = renderFrontmatter({ published: true })
    expect(out).toContain('published: true')
  })
  it('drops undefined keys', () => {
    const out = renderFrontmatter({ title: 'x', category: undefined })
    expect(out).not.toContain('category')
  })
})
