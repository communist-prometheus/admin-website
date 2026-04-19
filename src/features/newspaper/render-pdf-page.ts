const VENDOR = '/vendor/pdf.min.mjs'
const WORKER = '/vendor/pdf.worker.min.mjs'

const loadPdfJs = async () => {
  // @vite-ignore
  const mod = await import(VENDOR)
  mod.GlobalWorkerOptions.workerSrc = WORKER
  return mod
}

/**
 * Render the first page of a PDF to a PNG Blob.
 * @param pdfFile - PDF file
 * @returns PNG blob or undefined
 */
export const renderFirstPage = async (
  pdfFile: File
): Promise<Blob | undefined> => {
  const pdfjsLib = await loadPdfJs()
  const data = new Uint8Array(await pdfFile.arrayBuffer())
  const doc = await pdfjsLib.getDocument({ data }).promise
  const page = await doc.getPage(1)
  const viewport = page.getViewport({ scale: 2 })
  const canvas = globalThis.document.createElement('canvas')
  canvas.width = viewport.width
  canvas.height = viewport.height
  const ctx = canvas.getContext('2d')
  if (!ctx) return undefined
  await page.render({ canvasContext: ctx, viewport, canvas }).promise
  return new Promise<Blob | undefined>(resolve =>
    canvas.toBlob(b => resolve(b ?? undefined), 'image/png')
  )
}
