import { renderFirstPage } from './render-pdf-page'

const COVER_FILENAME = 'cover.png'

/**
 * Extract first page of a PDF as a PNG File.
 *
 * Errors propagate to the caller. The previous version silently
 * returned `undefined` on any failure, which made the broken
 * "PDF cover doesn't auto-extract" flow indistinguishable in the
 * UI from a happy-path no-op — editors had no signal that anything
 * had failed. Now exceptions reach the upload pipeline, which
 * surfaces them via the editor's error toast.
 *
 * @param pdfFile - PDF file to extract cover from
 * @returns PNG File of the first page
 * @throws when pdfjs / canvas / worker fails (network, OOM,
 *   incompatible PDF, missing worker script, etc.)
 */
export const extractPdfCover = async (pdfFile: File): Promise<File> => {
  const blob = await renderFirstPage(pdfFile)
  return new File([blob], COVER_FILENAME, { type: 'image/png' })
}
