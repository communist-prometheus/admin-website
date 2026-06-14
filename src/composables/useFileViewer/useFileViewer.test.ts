import { describe, expect, it, vi } from 'vitest'
import type { AssetDisplay } from '@/composables/useAssets/types'
import { useFileViewer } from './useFileViewer'

const asset = (over: Partial<AssetDisplay>): AssetDisplay => ({
  name: 'a.png',
  path: 'archive/x/assets/a.png',
  mimeType: 'image/png',
  thumbnailUrl: 'blob:a',
  status: 'committed',
  isCover: false,
  ...over,
})

describe('useFileViewer', () => {
  it('maps assets to viewer files (name, mime, url)', () => {
    const v = useFileViewer(
      () => [asset({}), asset({ name: 'b.txt', mimeType: 'text/plain' })],
      () => undefined
    )
    expect(v.files.value).toEqual([
      { name: 'a.png', mimeType: 'image/png', url: 'blob:a' },
      { name: 'b.txt', mimeType: 'text/plain', url: 'blob:a' },
    ])
  })

  it('opens at an index and closes', () => {
    const v = useFileViewer(
      () => [asset({})],
      () => undefined
    )
    expect(v.open.value).toBe(false)
    v.openAt(3)
    expect(v.open.value).toBe(true)
    expect(v.index.value).toBe(3)
    v.close()
    expect(v.open.value).toBe(false)
  })

  it('routes a download for the asset at an index', () => {
    const sink = vi.fn()
    const v = useFileViewer(
      () => [asset({ name: 'one.png' }), asset({ name: 'two.zip' })],
      sink
    )
    v.downloadAt(1)
    expect(sink).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'two.zip' })
    )
  })

  it('ignores a download for an out-of-range index', () => {
    const sink = vi.fn()
    const v = useFileViewer(() => [asset({})], sink)
    v.downloadAt(5)
    expect(sink).not.toHaveBeenCalled()
  })
})
