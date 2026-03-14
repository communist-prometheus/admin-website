import { describe, expect, it } from 'vitest'
import type { AssetItem } from '../useGitHubApi/asset-types'
import {
  committedToDisplay,
  isCoverMatch,
  pendingToDisplay,
} from './display-mappers'
import type { PendingAsset } from './types'

describe('isCoverMatch', () => {
  it('returns true when cover matches asset path', () => {
    expect(isCoverMatch('hero.svg', './assets/hero.svg')).toBe(true)
  })

  it('returns false when cover differs', () => {
    expect(isCoverMatch('hero.svg', './assets/other.svg')).toBe(false)
  })

  it('returns false when cover is undefined', () => {
    expect(isCoverMatch('hero.svg', undefined)).toBe(false)
  })
})

describe('committedToDisplay', () => {
  const item: AssetItem = {
    path: 'src/content/blog/test/assets/hero.svg',
    name: 'hero.svg',
    mimeType: 'image/svg+xml',
  }

  it('maps committed asset to display item', () => {
    const result = committedToDisplay(item, false, true, 'blob:x')
    expect(result).toEqual({
      name: 'hero.svg',
      path: item.path,
      mimeType: 'image/svg+xml',
      thumbnailUrl: 'blob:x',
      status: 'committed',
      isCover: true,
    })
  })

  it('sets pending-delete status', () => {
    const result = committedToDisplay(item, true, false, 'blob:x')
    expect(result.status).toBe('pending-delete')
  })
})

describe('pendingToDisplay', () => {
  const asset: PendingAsset = {
    name: 'new.png',
    base64: 'data...',
    mimeType: 'image/png',
    blobUrl: 'blob:y',
  }

  it('maps pending asset to display item', () => {
    const result = pendingToDisplay(asset, 'my-post', false)
    expect(result).toEqual({
      name: 'new.png',
      path: 'src/content/blog/my-post/assets/new.png',
      mimeType: 'image/png',
      thumbnailUrl: 'blob:y',
      status: 'pending-add',
      isCover: false,
    })
  })
})
