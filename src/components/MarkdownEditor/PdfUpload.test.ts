import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'
import PdfUpload from './PdfUpload.vue'

const PICKED_COVER = 'cover.png'
const EMITTED_COVER = 'cover.en.png'
const EMITTED_PDF = 'sample.en.pdf'

const fakePdf = (): File =>
  new File([new Uint8Array([0x25, 0x50, 0x44, 0x46])], 'issue.pdf', {
    type: 'application/pdf',
  })

const fakeCover = (): File =>
  new File([new Uint8Array([0x89, 0x50, 0x4e, 0x47])], PICKED_COVER, {
    type: 'image/png',
  })

type Wrapper = ReturnType<typeof mount>

const driveFileInput = async (
  wrapper: Wrapper,
  file: File
): Promise<void> => {
  const input = wrapper.get('input[type="file"]').element as HTMLInputElement
  Object.defineProperty(input, 'files', {
    value: { 0: file, length: 1, item: () => file },
    configurable: true,
  })
  await wrapper.get('input[type="file"]').trigger('change')
}

/*
 * The upload chain awaits a dynamic import of extract-pdf-cover —
 * on a cold CI runner that takes arbitrarily long, so the tests
 * wait event-driven on the TERMINAL emit of each scenario instead
 * of pumping the microtask queue a fixed number of times.
 */
const waitForEmit = (wrapper: Wrapper, event: string): Promise<void> =>
  vi.waitFor(() => {
    expect(wrapper.emitted(event)).toBeDefined()
  })

afterEach(() => vi.resetModules())

describe('PdfUpload — happy path', () => {
  it('emits upload-pdf, upload-cover, set-cover in order on PDF pick', async () => {
    /*
     * What this test pins (and what should regress loudly when the
     * actual prod bug is in flight): a successful cover extraction
     * MUST result in all three events. If the user picks a PDF and
     * sees no cover, one of these emissions is missing.
     */
    vi.doMock('@/features/magazine/extract-pdf-cover', () => ({
      extractPdfCover: async () => fakeCover(),
    }))
    const w = mount(PdfUpload, { props: { slug: 'sample', lang: 'en' } })
    await driveFileInput(w, fakePdf())
    await waitForEmit(w, 'set-cover')

    const pdfFile = w.emitted('upload-pdf')?.[0]?.[0] as File | undefined
    expect(pdfFile).toBeInstanceOf(File)
    expect(pdfFile?.name).toBe(EMITTED_PDF)
    const coverFile = w.emitted('upload-cover')?.[0]?.[0] as File | undefined
    expect(coverFile).toBeInstanceOf(File)
    expect(coverFile?.name).toBe(EMITTED_COVER)
    expect(w.emitted('set-cover')?.[0]?.[0]).toBe(EMITTED_COVER)
    expect(w.emitted('error')).toBeUndefined()
  })

  it('skips set-cover when frontmatter.image already set (custom cover preserved)', async () => {
    vi.doMock('@/features/magazine/extract-pdf-cover', () => ({
      extractPdfCover: async () => fakeCover(),
    }))
    const w = mount(PdfUpload, {
      props: {
        currentCover: './assets/custom.jpg',
        slug: 'sample',
        lang: 'en',
      },
    })
    await driveFileInput(w, fakePdf())
    // upload-cover is terminal here: the set-cover decision happens
    // synchronously in the same fan-out, so once upload-cover landed
    // the absence of set-cover is final.
    await waitForEmit(w, 'upload-cover')

    expect(w.emitted('upload-pdf')).toBeDefined()
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
    vi.doMock('@/features/magazine/extract-pdf-cover', () => ({
      extractPdfCover: async () => {
        throw new Error('worker fetch failed: 404')
      },
    }))
    const w = mount(PdfUpload, { props: { slug: 'sample', lang: 'en' } })
    await driveFileInput(w, fakePdf())
    await waitForEmit(w, 'error')

    expect(w.emitted('upload-pdf')).toBeDefined()
    expect(w.emitted('upload-cover')).toBeUndefined()
    expect(w.emitted('set-cover')).toBeUndefined()
    const errorEvent = w.emitted('error')?.[0]?.[0]
    expect(typeof errorEvent).toBe('string')
    expect(errorEvent).toMatch(/worker fetch failed: 404/)
  })

  it('non-PDF files are rejected without emitting anything', async () => {
    vi.doMock('@/features/magazine/extract-pdf-cover', () => ({
      extractPdfCover: async () => fakeCover(),
    }))
    const w = mount(PdfUpload, { props: { slug: 'sample', lang: 'en' } })
    const fakeImage = new File(['x'], 'photo.png', { type: 'image/png' })
    await driveFileInput(w, fakeImage)
    // Non-PDF short-circuits synchronously; a microtask flush is all
    // the chain needs before asserting silence.
    await nextTick()
    await nextTick()

    expect(w.emitted('upload-pdf')).toBeUndefined()
    expect(w.emitted('upload-cover')).toBeUndefined()
    expect(w.emitted('set-cover')).toBeUndefined()
    expect(w.emitted('error')).toBeUndefined()
  })
})
