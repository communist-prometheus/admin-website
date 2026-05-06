import { afterEach, describe, expect, it, vi } from 'vitest'
import { extractPdfCover } from './extract-pdf-cover'
import * as renderModule from './render-pdf-page'

const fakePdf = (): File =>
  new File([new Uint8Array([0x25, 0x50, 0x44, 0x46])], 'issue.pdf', {
    type: 'application/pdf',
  })

const fakeBlob = (): Blob => new Blob(['png-bytes'], { type: 'image/png' })

afterEach(() => vi.restoreAllMocks())

describe('extractPdfCover', () => {
  it('returns a PNG File named cover.png when render succeeds', async () => {
    vi.spyOn(renderModule, 'renderFirstPage').mockResolvedValue(fakeBlob())
    const out = await extractPdfCover(fakePdf())
    expect(out.name).toBe('cover.png')
    expect(out.type).toBe('image/png')
    expect(out).toBeInstanceOf(File)
  })

  it('propagates errors from the renderer instead of swallowing them', async () => {
    /*
     * Pre-fix: extractPdfCover wrapped the renderer in a `try {} catch
     * { return undefined }`. That made the "no cover appeared" symptom
     * indistinguishable from a successful no-op in the UI. The fix is
     * to let exceptions bubble so the upload pipeline can surface them
     * via the editor's error toast — which is exactly what this test
     * pins.
     */
    vi.spyOn(renderModule, 'renderFirstPage').mockRejectedValue(
      new Error('worker fetch failed: 404')
    )
    await expect(extractPdfCover(fakePdf())).rejects.toThrow(
      /worker fetch failed: 404/
    )
  })
})
