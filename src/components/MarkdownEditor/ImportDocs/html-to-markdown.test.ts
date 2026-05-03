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

  it('replaces mammoth footnote refs with GFM markers (no leftover placeholders)', () => {
    /*
     * Regression test for the docx-import bug the editor hit in
     * the content-repo "from-manchester-to-global" article: the
     * old underscore placeholder collided with turndown's
     * markdown-italic escaping, so saved files had literal
     * `@@FOOTNOTE\_REF\_1@@` leak through. Now: footnote ref
     * should always become `[^N]` and a `[^N]: body` definition
     * appended at the end. No leftover placeholder of any shape.
     */
    const html =
      '<p>see<sup><a href="#footnote-1">[1]</a></sup></p>' +
      '<hr><ol><li id="footnote-1">body<a href="#footnote-ref-1">↑</a></li></ol>'
    const md = htmlToMarkdown(html)
    expect(md).toContain('see[^1]')
    expect(md).toContain('[^1]: body')
    expect(md).not.toContain('@@FOOTNOTE')
    expect(md).not.toContain('XXFOOTNOTE')
  })
})
