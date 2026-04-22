import { describe, expect, it } from 'vitest'
import { rewriteImages } from './rewrite-images'

describe('rewriteImages', () => {
  it('replaces a data URI with the local asset path', () => {
    const html = '<img src="data:image/png;base64,AA=="/>'
    const out = rewriteImages(html, [
      { dataUri: 'data:image/png;base64,AA==', filename: 'docx-img-1.png' },
    ])
    expect(out).toContain('./assets/docx-img-1.png')
    expect(out).not.toContain('data:image/png')
  })

  it('returns the HTML unchanged when no images were extracted', () => {
    const html = '<p>plain</p>'
    expect(rewriteImages(html, [])).toBe(html)
  })

  it('replaces every occurrence of the same data URI', () => {
    const dup = 'data:image/gif;base64,BB=='
    const html = `<img src="${dup}"/><img src="${dup}"/>`
    const out = rewriteImages(html, [{ dataUri: dup, filename: 'x.gif' }])
    const matches = out.match(/\.\/assets\/x\.gif/g) ?? []
    expect(matches).toHaveLength(2)
  })
})
