/**
 * Render the first page of a PDF to a PNG Blob using mupdf-wasm.
 *
 * Why mupdf and not pdf.js: the user's real Italian magazine PDF
 * triggers a pdf.js render bug — pdf.js silently picks content
 * from a different layer/object and outputs the Russian back-cover
 * masthead in place of the actual front cover. Edge, Poppler/cairo,
 * and mupdf all render the same file correctly. The fixture
 * `magazine-1-it.pdf` + `extract-pdf-cover.fixture.test.ts` pin
 * this regression. mupdf is AGPL-3.0; the project repo is public,
 * so the licence aligns.
 *
 * Errors propagate to the caller — the editor's upload pipeline
 * surfaces them via the error toast.
 * @param pdfFile - PDF file to render
 * @returns PNG blob of the first page
 * @throws when mupdf fails to load, parse, or render
 */
export const renderFirstPage = async (pdfFile: File): Promise<Blob> => {
  const mupdf = await import('mupdf')
  const data = new Uint8Array(await pdfFile.arrayBuffer())
  const doc = mupdf.PDFDocument.openDocument(data, 'application/pdf')
  if (doc.countPages() === 0) {
    throw new Error('PDF has no pages')
  }
  const page = doc.loadPage(0)
  /* Scale 2 keeps the cover crisp on 1x and 2x displays. */
  const pixmap = page.toPixmap(
    [2, 0, 0, 2, 0, 0],
    mupdf.ColorSpace.DeviceRGB,
    false,
    true
  )
  /*
   * mupdf's `asPNG()` returns Uint8Array<SharedArrayBuffer> in
   * type-land; copy into a fresh Uint8Array<ArrayBuffer> so the
   * Blob constructor accepts it without needing `as`. The copy is
   * O(N) bytes and only runs once per upload.
   */
  const raw = pixmap.asPNG()
  const png = new Uint8Array(raw.length)
  png.set(raw)
  page.destroy()
  pixmap.destroy()
  return new Blob([png], { type: 'image/png' })
}
