import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  downloadAsset,
  resolveDownloadUrl,
  triggerDownload,
} from './download-asset'

vi.mock('./resolve-asset-url', () => ({
  resolveAssetUrl: vi.fn(async (path: string) => `blob:resolved/${path}`),
}))

const { resolveAssetUrl } = await import('./resolve-asset-url')

afterEach(() => {
  vi.clearAllMocks()
})

describe('resolveDownloadUrl', () => {
  it('uses the in-memory blob URL for a pending asset', async () => {
    const url = await resolveDownloadUrl({
      path: 'archive/x/assets/a.png',
      name: 'a.png',
      blobUrl: 'blob:pending/a',
    })
    expect(url).toBe('blob:pending/a')
    expect(resolveAssetUrl).not.toHaveBeenCalled()
  })

  it('fetches a committed asset through the SW resolver', async () => {
    const url = await resolveDownloadUrl({
      path: 'archive/x/assets/b.txt',
      name: 'b.txt',
    })
    expect(url).toBe('blob:resolved/archive/x/assets/b.txt')
    expect(resolveAssetUrl).toHaveBeenCalledWith('archive/x/assets/b.txt')
  })
})

describe('triggerDownload', () => {
  it('anchors the URL with the download filename and clicks once', () => {
    const click = vi.fn()
    const anchor = { click, remove: vi.fn() } as unknown as HTMLAnchorElement
    const create = vi.spyOn(document, 'createElement').mockReturnValue(anchor)
    const append = vi
      .spyOn(document.body, 'append')
      .mockImplementation(() => undefined)

    triggerDownload('blob:url/x', 'report.pdf')

    expect(create).toHaveBeenCalledWith('a')
    expect(anchor.href).toBe('blob:url/x')
    expect(anchor.download).toBe('report.pdf')
    expect(append).toHaveBeenCalledWith(anchor)
    expect(click).toHaveBeenCalledOnce()

    create.mockRestore()
    append.mockRestore()
  })
})

describe('downloadAsset', () => {
  it('resolves then triggers a download under the original name', async () => {
    const click = vi.fn()
    const anchor = { click, remove: vi.fn() } as unknown as HTMLAnchorElement
    vi.spyOn(document, 'createElement').mockReturnValue(anchor)
    vi.spyOn(document.body, 'append').mockImplementation(() => undefined)

    await downloadAsset({
      path: 'archive/x/assets/c.zip',
      name: 'c.zip',
    })

    expect(anchor.href).toBe('blob:resolved/archive/x/assets/c.zip')
    expect(anchor.download).toBe('c.zip')
    expect(click).toHaveBeenCalledOnce()
  })
})
