import { describe, expect, it } from 'vitest'
import { htmlToMarkdown } from './html-to-markdown'

describe('htmlToMarkdown', () => {
  it('renders headings, bold, italic, and links', () => {
    const html =
      '<h1>Hi</h1><p><strong>bold</strong> <em>italic</em> ' +
      '<a href="http://x">link</a></p>'
    const md = htmlToMarkdown(html)
    expect(md).toContain('# Hi')
    expect(md).toContain('**bold**')
    expect(md).toContain('_italic_')
    expect(md).toContain('[link](http://x)')
  })

  it('renders unordered and ordered lists', () => {
    const md = htmlToMarkdown(
      '<ul><li>a</li><li>b</li></ul><ol><li>c</li></ol>'
    )
    expect(md).toMatch(/^-\s+a/m)
    expect(md).toMatch(/^-\s+b/m)
    expect(md).toMatch(/^1\.\s+c/m)
  })

  it('renders fenced code blocks', () => {
    const md = htmlToMarkdown('<pre><code>hello</code></pre>')
    expect(md).toContain('```')
    expect(md).toContain('hello')
  })

  it('renders images with the expected markdown', () => {
    const md = htmlToMarkdown('<img src="./assets/x.png" alt="alt"/>')
    expect(md).toContain('![alt](./assets/x.png)')
  })
})
