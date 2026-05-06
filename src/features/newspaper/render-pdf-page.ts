const VENDOR = '/vendor/pdf.min.mjs'
const WORKER = '/vendor/pdf.worker.min.mjs'

const loadPdfJs = async () => {
  // @vite-ignore
  const mod = await import(VENDOR)
  mod.GlobalWorkerOptions.workerSrc = WORKER
  return mod
}

const toBlob = (canvas: HTMLCanvasElement): Promise<Blob> =>
  new Promise<Blob>((resolve, reject) =>
    canvas.toBlob(
      b =>
        b ? resolve(b) : reject(new Error('canvas.toBlob returned null')),
      'image/png'
    )
  )

/**
 * Render the first page of a PDF to a PNG Blob.
 *
 * Throws on any failure rather than returning undefined — the
 * editor's upload pipeline catches and surfaces these via the error
 * toast, so the "no cover appeared" symptom now carries a real
 * message (worker fetch failed, canvas 2d context unavailable,
 * pdfjs OOM, etc.) instead of being a silent no-op.
 *
 * @param pdfFile - PDF file to render
 * @returns PNG blob of the first page
 * @throws when pdfjs / canvas / worker fails
 */
export const renderFirstPage = async (pdfFile: File): Promise<Blob> => {
  const pdfjsLib = await loadPdfJs()
  const data = new Uint8Array(await pdfFile.arrayBuffer())
  const doc = await pdfjsLib.getDocument({ data }).promise
  const page = await doc.getPage(1)
  const viewport = page.getViewport({ scale: 2 })
  const canvas = globalThis.document.createElement('canvas')
  canvas.width = viewport.width
  canvas.height = viewport.height
  const ctx = canvas.getContext('2d')
  if (ctx === null) {
    throw new Error('canvas 2d context unavailable')
  }
  await page.render({ canvasContext: ctx, viewport, canvas }).promise
  return toBlob(canvas)
}
