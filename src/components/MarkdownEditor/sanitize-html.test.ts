import { describe, expect, it } from 'vitest'
import { sanitizeHtml } from './sanitize-html'

describe('sanitizeHtml XSS vectors', () => {
  it('strips script tags', () => {
    const out = sanitizeHtml('<p>hi</p><script>steal()</script>')
    expect(out).toBe('<p>hi</p>')
  })

  it('strips event handlers from img', () => {
    const out = sanitizeHtml('<img src="x" onerror="steal()">')
    expect(out).not.toContain('onerror')
    expect(out).toContain('<img')
  })

  it('strips javascript: hrefs', () => {
    const out = sanitizeHtml('<a href="javascript:steal()">x</a>')
    expect(out).not.toContain('javascript:')
  })

  it('strips iframes', () => {
    const out = sanitizeHtml('<iframe src="https://evil.example"></iframe>')
    expect(out).not.toContain('iframe')
  })

  it('strips data: URLs in src', () => {
    const out = sanitizeHtml(
      '<img src="data:text/html,<script>steal()</script>">'
    )
    expect(out).not.toContain('data:')
  })
})

describe('sanitizeHtml legitimate content', () => {
  it('keeps blob: asset previews', () => {
    const out = sanitizeHtml('<img src="blob:http://localhost/abc" alt="a">')
    expect(out).toContain('blob:http://localhost/abc')
  })

  it('keeps relative asset paths', () => {
    const out = sanitizeHtml('<img src="./assets/pic.png" alt="a">')
    expect(out).toContain('./assets/pic.png')
  })

  it('keeps footnote ids and anchors', () => {
    const html =
      '<sup><a href="#user-content-fn-1" id="user-content-fnref-1">1</a></sup>'
    const out = sanitizeHtml(html)
    expect(out).toContain('#user-content-fn-1')
    expect(out).toContain('id="user-content-fnref-1"')
  })

  it('keeps media elements used by the asset renderer', () => {
    const html =
      '<video controls><source src="./assets/clip.mp4" type="video/mp4"></video>'
    const out = sanitizeHtml(html)
    expect(out).toContain('<video')
    expect(out).toContain('<source')
  })

  it('keeps https links and images', () => {
    const out = sanitizeHtml(
      '<a href="https://comprom.org">x</a><img src="https://comprom.org/a.png">'
    )
    expect(out).toContain('https://comprom.org')
  })
})
