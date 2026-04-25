import { promoteNumberedListHeadings } from './promote-numbered-list-headings'
import { promoteVisualHeadings } from './promote-visual-headings'

/**
 * Apply structural promotions that turn the visual-only heading
 * shapes mammoth (and Word-exported HTML) emit into real `<hN>`
 * elements. Used by every import path — .docx, .html, .htm — so
 * the same heuristics fire regardless of how the document was
 * authored.
 *
 * @param html source HTML
 * @returns HTML with bold-only and numbered-list heading shapes
 *   promoted to real headings
 */
export const normaliseImportHtml = (html: string): string =>
  promoteVisualHeadings(promoteNumberedListHeadings(html))
