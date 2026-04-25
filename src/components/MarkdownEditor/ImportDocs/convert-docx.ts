import mammoth from 'mammoth'

const STYLE_MAP: string[] = [
  "p[style-name='Title'] => h1:fresh",
  "p[style-name='Subtitle'] => h2:fresh",
  "p[style-name='Heading 1'] => h1:fresh",
  "p[style-name='Heading 2'] => h2:fresh",
  "p[style-name='Heading 3'] => h3:fresh",
  "p[style-name='Heading 4'] => h4:fresh",
  "p[style-name='Heading 5'] => h5:fresh",
  "p[style-name='Heading 6'] => h6:fresh",
]

/**
 * Convert a .docx ArrayBuffer to mammoth's HTML output. Heading
 * normalisation (visual-bold paragraphs, single-item bold-only
 * ordered lists) lives in `normaliseImportHtml` and runs in the
 * shared `fromHtml` path so it applies to .html imports too.
 *
 * @param buffer raw .docx bytes
 * @returns mammoth HTML string (no post-processing applied here)
 */
export const convertDocxToHtml = async (
  buffer: ArrayBuffer
): Promise<string> => {
  const result = await mammoth.convertToHtml(
    { arrayBuffer: buffer },
    { styleMap: STYLE_MAP }
  )
  return result.value
}
