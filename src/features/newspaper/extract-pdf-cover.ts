import { renderFirstPage } from './render-pdf-page'

/**
 * Extract first page of a PDF as a PNG File.
 * @param pdfFile - PDF file to extract cover from
 * @returns PNG File of the first page, or undefined on error
 */
export const extractPdfCover = async (
  pdfFile: File
): Promise<File | undefined> => {
  try {
    const blob = await renderFirstPage(pdfFile)
    if (!blob) return undefined
    return new File([blob], 'cover.png', { type: 'image/png' })
  } catch {
    return undefined
  }
}
