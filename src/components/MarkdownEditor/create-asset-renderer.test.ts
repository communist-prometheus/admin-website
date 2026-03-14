import { Marked } from 'marked'
import { describe, expect, it } from 'vitest'
import { createAssetExtension, resolveHtmlSrc } from './create-asset-renderer'

describe('resolveHtmlSrc', () => {
  it('replaces ./assets/ src with blob URL', () => {
    const map = new Map([['./assets/hero.svg', 'blob:abc']])
    const html = '<img src="./assets/hero.svg">'
    expect(resolveHtmlSrc(html, map)).toBe('<img src="blob:abc">')
  })

  it('preserves src when no match found', () => {
    const html = '<img src="./assets/x.png">'
    expect(resolveHtmlSrc(html, new Map())).toBe(html)
  })

  it('replaces multiple src attributes', () => {
    const map = new Map([
      ['./assets/a.svg', 'blob:1'],
      ['./assets/b.png', 'blob:2'],
    ])
    const html = '<source src="./assets/a.svg"><source src="./assets/b.png">'
    const result = resolveHtmlSrc(html, map)
    expect(result).toContain('src="blob:1"')
    expect(result).toContain('src="blob:2"')
  })

  it('ignores non-asset src attributes', () => {
    const html = '<img src="https://example.com/img.png">'
    expect(resolveHtmlSrc(html, new Map())).toBe(html)
  })
})

describe('createAssetExtension', () => {
  it('resolves image src via marked', () => {
    const map = new Map([['./assets/hero.svg', 'blob:abc']])
    const m = new Marked(createAssetExtension(map))
    const html = m.parse('![Hero](./assets/hero.svg)')
    expect(html).toContain('src="blob:abc"')
    expect(html).toContain('alt="Hero"')
  })

  it('escapes quotes in alt text', () => {
    const m = new Marked(createAssetExtension(new Map()))
    const html = m.parse('![say "hi"](./assets/x.png)')
    expect(html).toContain('alt="say &quot;hi&quot;"')
  })
})
