import { describe, expect, it } from 'vitest'
import { buildAssetPath, buildAssetsPrefix } from './build-asset-path'

describe('buildAssetPath', () => {
  it('builds full path for an asset', () => {
    const result = buildAssetPath('my-post', 'hero.svg')
    expect(result).toBe('blog/my-post/assets/hero.svg')
  })

  it('handles slugs with hyphens', () => {
    const result = buildAssetPath('a-b-c', 'img.png')
    expect(result).toBe('blog/a-b-c/assets/img.png')
  })
})

describe('buildAssetsPrefix', () => {
  it('builds assets directory prefix', () => {
    expect(buildAssetsPrefix('my-post')).toBe('blog/my-post/assets')
  })
})
