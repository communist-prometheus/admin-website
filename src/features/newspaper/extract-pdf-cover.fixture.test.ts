import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { renderFirstPage } from './render-pdf-page'

/*
 * Resolve the fixture relative to the repo root. Vitest runs from
 * the package root (per vitest.config.ts), so process.cwd() is
 * stable here. The fixture lives next to the test on disk so it
 * can be inspected manually if a regression flips.
 */
const FIXTURE = join(
  process.cwd(),
  'src/features/newspaper/__fixtures__/magazine-1-it.pdf'
)
const raw = readFileSync(FIXTURE)
const fixtureBytes: ArrayBuffer = raw.buffer.slice(
  raw.byteOffset,
  raw.byteOffset + raw.byteLength
)

/*
 * Real-world regression: the user's Italian magazine PDF
 * (`Magazine 1 It.pdf`) renders correctly in Edge, Poppler/cairo,
 * and mupdf — but pdf.js (5.6 AND 5.7) silently picks content from
 * a different layer and outputs the Russian back-cover masthead in
 * place of the actual front cover. This test pins the post-fix
 * renderer (mupdf-wasm) by inspecting a pixel signature that only
 * the Italian front cover produces: the centre of the page holds
 * the large fist illustration (lots of dark / coloured pixels),
 * whereas the Russian masthead leaves the centre blank white.
 */
const fixtureFile = (): File =>
  new File([fixtureBytes], 'magazine-1-it.pdf', { type: 'application/pdf' })

describe('extract-pdf-cover — Italian magazine fixture', () => {
  it('renderFirstPage outputs a substantial PNG for a real magazine PDF', async () => {
    const blob = await renderFirstPage(fixtureFile())
    expect(blob.type).toBe('image/png')
    expect(blob.size, 'PNG must be substantial').toBeGreaterThan(50_000)
  })

  it('the rendered page 1 carries the Italian cover illustration in its centre', async () => {
    /*
     * The Italian cover and the Russian back-cover masthead share
     * the same "red corner badge in the top-right" shape, so a
     * red-pixel test there cannot tell them apart. The decisive
     * difference is the CENTRE of the page: the Italian cover
     * holds the large fist illustration (lots of dark / coloured
     * pixels), the Russian masthead leaves the centre blank.
     *
     * Pixel inspection happens directly on the mupdf pixmap rather
     * than re-decoding the PNG, because jsdom's Image doesn't
     * actually decode bitmaps. This mirrors the same render call
     * `renderFirstPage` makes (scale 2, RGB, alpha=true).
     */
    const buf = new Uint8Array(fixtureBytes)
    const mupdf = await import('mupdf')
    const doc = mupdf.PDFDocument.openDocument(buf, 'application/pdf')
    const page = doc.loadPage(0)
    const pixmap = page.toPixmap(
      [2, 0, 0, 2, 0, 0],
      mupdf.ColorSpace.DeviceRGB,
      false,
      true
    )
    const samples = pixmap.getPixels()
    const w = pixmap.getWidth()
    const h = pixmap.getHeight()
    const stride = pixmap.getStride()
    const x0 = Math.round(w * 0.25)
    const x1 = Math.round(w * 0.75)
    const y0 = Math.round(h * 0.35)
    const y1 = Math.round(h * 0.75)
    let nonWhite = 0
    for (let y = y0; y < y1; y++) {
      for (let x = x0; x < x1; x++) {
        const off = y * stride + x * 4
        const r = samples[off] ?? 255
        const g = samples[off + 1] ?? 255
        const b = samples[off + 2] ?? 255
        const brightness = (r + g + b) / 3
        if (brightness < 220) nonWhite++
      }
    }
    expect(
      nonWhite,
      `centre of the rendered page must contain illustration ink ` +
        `(observed non-white pixel count: ${nonWhite}).`
    ).toBeGreaterThan(20_000)
    page.destroy()
    pixmap.destroy()
  })
})
