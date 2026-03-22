import { describe, expect, it } from 'vitest'
import { buildAssetPath, buildAssetsPrefix } from './build-asset-path'

describe('buildAssetPath', () => {
  it('builds full path for a blog asset', () => {
    const result = buildAssetPath('blog', 'my-post', 'hero.svg')
    expect(result).toBe('blog/my-post/assets/hero.svg')
  })

  it('builds full path for a positions asset', () => {
    const result = buildAssetPath('positions', 'a-b-c', 'img.png')
    expect(result).toBe('positions/a-b-c/assets/img.png')
  })

  it('builds full path for a pages asset', () => {
    const result = buildAssetPath('pages', 'home', 'hero.jpg')
    expect(result).toBe('pages/home/assets/hero.jpg')
  })
})

describe('buildAssetsPrefix', () => {
  it('builds assets directory prefix for blog', () => {
    expect(buildAssetsPrefix('blog', 'my-post')).toBe('blog/my-post/assets')
  })

  it('builds assets directory prefix for positions', () => {
    expect(buildAssetsPrefix('positions', 'digital-sovereignty')).toBe(
      'positions/digital-sovereignty/assets'
    )
  })
})
