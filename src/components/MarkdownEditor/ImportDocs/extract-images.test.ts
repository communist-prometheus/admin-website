import { describe, expect, it } from 'vitest'
import { extractImages } from './extract-images'

const tiny =
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII='

describe('extractImages', () => {
  it('extracts a single png data URI', () => {
    const html = `<p>hi</p><img src="data:image/png;base64,${tiny}"/>`
    const out = extractImages(html, 'docx-img')
    expect(out).toHaveLength(1)
    expect(out[0]?.filename).toBe('docx-img-1.png')
    expect(out[0]?.file.type).toBe('image/png')
  })

  it('numbers multiple images', () => {
    const html =
      `<img src="data:image/jpeg;base64,${tiny}"/>` +
      `<img src="data:image/gif;base64,${tiny}"/>`
    const out = extractImages(html, 'p')
    expect(out.map(o => o.filename)).toEqual(['p-1.jpg', 'p-2.gif'])
  })

  it('ignores http(s) image sources', () => {
    const html = '<img src="https://example.com/a.png"/>'
    expect(extractImages(html, 'p')).toHaveLength(0)
  })

  it('returns empty list for HTML with no images', () => {
    expect(extractImages('<p>hi</p>', 'p')).toHaveLength(0)
  })
})
