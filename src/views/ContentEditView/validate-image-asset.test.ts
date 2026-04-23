import { describe, expect, it } from 'vitest'
import { validateImageAsset } from './validate-image-asset'

const assets = ['hero.svg', 'cover.jpg']

describe('validateImageAsset', () => {
  it('returns undefined when image is absent', () => {
    expect(validateImageAsset(undefined, assets)).toBeUndefined()
  })

  it('returns undefined when image is empty string', () => {
    expect(validateImageAsset('', assets)).toBeUndefined()
  })

  it('accepts a reference to an existing asset', () => {
    expect(validateImageAsset('./assets/hero.svg', assets)).toBeUndefined()
  })

  it('rejects a non-string image', () => {
    expect(validateImageAsset(42, assets)).toMatch(/must be a string/)
  })

  it('rejects a path that is not under ./assets/', () => {
    expect(validateImageAsset('/uploads/x.png', assets)).toMatch(
      /reference a local asset path/
    )
  })

  it('rejects a reference to a missing asset', () => {
    expect(validateImageAsset('./assets/missing.png', assets)).toMatch(
      /not present in this article/
    )
  })
})
