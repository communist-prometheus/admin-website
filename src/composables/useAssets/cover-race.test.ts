import { describe, expect, it } from 'vitest'
import { createAddAsset } from './add-asset'
import { createSetCover } from './cover-ops'
import { createAssetState } from './state'
import { createCoverUrl, createUrlMap } from './url-map'

const fakePng = (name = 'cover.png'): File =>
  new File([new Uint8Array([0x89, 0x50, 0x4e, 0x47])], name, {
    type: 'image/png',
  })

const setupAssets = (initialCover?: string) => {
  const state = createAssetState(initialCover)
  const urlMap = createUrlMap(state)
  return {
    state,
    urlMap,
    addAsset: createAddAsset(state),
    setCover: createSetCover(state),
    coverUrl: createCoverUrl(state, urlMap),
  }
}

const flushAsync = async (): Promise<void> => {
  await Promise.resolve()
  await Promise.resolve()
  await new Promise(r => setTimeout(r, 0))
}

const COVER = 'cover.png'

describe('cover ↔ add-asset race', () => {
  it('coverUrl resolves when set-cover fires BEFORE add-asset settles', async () => {
    /*
     * This is the order PdfUpload uses today:
     *   emit('upload-cover', file)   // → addAsset(file) — async, fileToBase64
     *   emit('set-cover', name)      // → setCover(name)  — sync
     *
     * setCover writes coverPath synchronously. addAsset awaits
     * fileToBase64 and only then writes pendingAdds. If the cover URL
     * doesn't resolve once both have settled, the user sees an empty
     * cover slot — exactly the reported bug.
     */
    const a = setupAssets()
    const addPromise = a.addAsset(fakePng())
    a.setCover(COVER)
    expect(a.coverUrl.value).toBeUndefined()
    await addPromise
    await flushAsync()
    expect(a.coverUrl.value).toBeTypeOf('string')
    expect(a.coverUrl.value).toMatch(/^blob:/)
  })

  it('coverUrl resolves when add-asset settles BEFORE set-cover', async () => {
    const a = setupAssets()
    await a.addAsset(fakePng())
    a.setCover(COVER)
    await flushAsync()
    expect(a.coverUrl.value).toMatch(/^blob:/)
  })

  it('replacing cover.png updates coverUrl to the new blob', async () => {
    const a = setupAssets()
    await a.addAsset(fakePng())
    a.setCover(COVER)
    const first = a.coverUrl.value
    expect(first).toMatch(/^blob:/)
    await a.addAsset(fakePng())
    await flushAsync()
    const second = a.coverUrl.value
    expect(second).toMatch(/^blob:/)
    expect(second).not.toBe(first)
  })

  it('setting cover for a file that has not been added yet leaves coverUrl unresolved', async () => {
    /*
     * Documents the failure mode: if add-asset is never called (e.g.
     * extractPdfCover threw and the catch swallowed it before my
     * recent fix), setCover alone produces a coverPath that the URL
     * map can't resolve — no blob URL, empty cover slot. Pinning so
     * the next regression of this kind shows up loudly.
     */
    const a = setupAssets()
    a.setCover(COVER)
    await flushAsync()
    expect(a.state.coverPath.value).toBe(`./assets/${COVER}`)
    expect(a.coverUrl.value).toBeUndefined()
  })
})
