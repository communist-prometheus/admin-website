import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'
import PdfUpload from './PdfUpload.vue'

const COVER_NAME = 'cover.png'

const fakePdf = (): File =>
  new File([new Uint8Array([0x25, 0x50, 0x44, 0x46])], 'issue.pdf', {
    type: 'application/pdf',
  })

const fakeCover = (): File =>
  new File([new Uint8Array([0x89, 0x50, 0x4e, 0x47])], COVER_NAME, {
    type: 'image/png',
  })

const driveFileInput = async (
  wrapper: ReturnType<typeof mount>,
  file: File
): Promise<void> => {
  const input = wrapper.get('input[type="file"]').element as HTMLInputElement
  Object.defineProperty(input, 'files', {
    value: { 0: file, length: 1, item: () => file },
    configurable: true,
  })
  await wrapper.get('input[type="file"]').trigger('change')
  /*
   * handleFile awaits the dynamic import of extract-pdf-cover. Drive
   * the microtask queue several times so the async chain resolves
   * before the test inspects emitted events.
   */
  await nextTick()
  await nextTick()
  await nextTick()
  await new Promise(r => setTimeout(r, 10))
  await nextTick()
}

afterEach(() => vi.resetModules())

describe('PdfUpload — happy path', () => {
  it('emits upload-pdf, upload-cover, set-cover in order on PDF pick', async () => {
    /*
     * What this test pins (and what should regress loudly when the
     * actual prod bug is in flight): a successful cover extraction
     * MUST result in all three events. If the user picks a PDF and
     * sees no cover, one of these emissions is missing.
     */
    vi.doMock('@/features/newspaper/extract-pdf-cover', () => ({
      extractPdfCover: async () => fakeCover(),
    }))
    const w = mount(PdfUpload, { props: {} })
    await driveFileInput(w, fakePdf())

    expect(w.emitted('upload-pdf')?.[0]?.[0]).toBeInstanceOf(File)
    const coverFile = w.emitted('upload-cover')?.[0]?.[0] as File | undefined
    expect(coverFile).toBeInstanceOf(File)
    expect(coverFile?.name).toBe(COVER_NAME)
    expect(w.emitted('set-cover')?.[0]?.[0]).toBe(COVER_NAME)
    expect(w.emitted('error')).toBeUndefined()
  })

  it('skips set-cover when frontmatter.image already set (custom cover preserved)', async () => {
    vi.doMock('@/features/newspaper/extract-pdf-cover', () => ({
      extractPdfCover: async () => fakeCover(),
    }))
    const w = mount(PdfUpload, {
      props: { currentCover: './assets/custom.jpg' },
    })
    await driveFileInput(w, fakePdf())

    expect(w.emitted('upload-pdf')).toBeDefined()
    expect(w.emitted('upload-cover')).toBeDefined()
    expect(w.emitted('set-cover')).toBeUndefined()
  })
})

describe('PdfUpload — error path', () => {
  it('emits error and skips upload-cover/set-cover when extraction throws', async () => {
    /*
     * The previous implementation swallowed extraction errors and
     * silently returned undefined — editor saw a PDF added and no
     * cover, with no signal of what went wrong. The contract is now:
     * any failure surfaces via the `error` event; upload-cover and
     * set-cover MUST NOT fire on the error path.
     */
    vi.doMock('@/features/newspaper/extract-pdf-cover', () => ({
      extractPdfCover: async () => {
        throw new Error('worker fetch failed: 404')
      },
    }))
    const w = mount(PdfUpload, { props: {} })
    await driveFileInput(w, fakePdf())

    expect(w.emitted('upload-pdf')).toBeDefined()
    expect(w.emitted('upload-cover')).toBeUndefined()
    expect(w.emitted('set-cover')).toBeUndefined()
    const errorEvent = w.emitted('error')?.[0]?.[0]
    expect(typeof errorEvent).toBe('string')
    expect(errorEvent).toMatch(/worker fetch failed: 404/)
  })

  it('non-PDF files are rejected without emitting anything', async () => {
    vi.doMock('@/features/newspaper/extract-pdf-cover', () => ({
      extractPdfCover: async () => fakeCover(),
    }))
    const w = mount(PdfUpload, { props: {} })
    const fakeImage = new File(['x'], 'photo.png', { type: 'image/png' })
    await driveFileInput(w, fakeImage)

    expect(w.emitted('upload-pdf')).toBeUndefined()
    expect(w.emitted('upload-cover')).toBeUndefined()
    expect(w.emitted('set-cover')).toBeUndefined()
    expect(w.emitted('error')).toBeUndefined()
  })
})
