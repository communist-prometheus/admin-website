import { convertDocxToHtml } from './convert-docx'
import { extractImages } from './extract-images'
import { generateToc } from './generate-toc'
import { htmlToMarkdown } from './html-to-markdown'
import { normaliseImportHtml } from './normalise-html'
import { rewriteImages } from './rewrite-images'

/** Output of an import: converted markdown and accompanying images. */
export interface ImportResult {
  readonly markdown: string
  readonly images: readonly File[]
}

const UNSUPPORTED = 'Unsupported file type. Pick a .docx, .html, or .md.'
const EMPTY: ImportResult = { markdown: '', images: [] }

const fromHtml = (html: string, prefix: string): ImportResult => {
  const normalised = normaliseImportHtml(html)
  const images = extractImages(normalised, prefix)
  const clean = rewriteImages(normalised, images)
  return {
    markdown: generateToc(htmlToMarkdown(clean)),
    images: images.map(i => i.file),
  }
}

const fromDocx = async (file: File): Promise<ImportResult> => {
  const buffer = await file.arrayBuffer()
  const html = await convertDocxToHtml(buffer)
  return fromHtml(html, 'docx-img')
}

const ext = (file: File): string =>
  file.name.toLowerCase().split('.').pop() ?? ''

/**
 * Parse a user-picked file and return clean Markdown plus any images
 * that need to be uploaded as assets alongside.
 *
 * @param file picker file from the toolbar
 * @returns markdown + image files; throws on unsupported type
 */
export const importFile = async (file: File): Promise<ImportResult> => {
  const e = ext(file)
  if (e === 'docx') return fromDocx(file)
  if (e === 'html' || e === 'htm') {
    return fromHtml(await file.text(), 'html-img')
  }
  if (e === 'md') return { ...EMPTY, markdown: await file.text() }
  throw new Error(UNSUPPORTED)
}
