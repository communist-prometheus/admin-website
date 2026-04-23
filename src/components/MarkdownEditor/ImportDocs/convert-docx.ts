import mammoth from 'mammoth'
import { promoteVisualHeadings } from './promote-visual-headings'

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
 * Convert a .docx ArrayBuffer to HTML via mammoth and promote visual
 * titles (bold-only paragraphs used as section headings) to real
 * `<hN>` elements so the markdown has a real outline. Embedded
 * images are still emitted as inline base64 data URIs; callers
 * extract them later.
 *
 * @param buffer raw .docx bytes
 * @returns mammoth HTML string with visual headings upgraded
 */
export const convertDocxToHtml = async (
  buffer: ArrayBuffer
): Promise<string> => {
  const result = await mammoth.convertToHtml(
    { arrayBuffer: buffer },
    {
      styleMap: STYLE_MAP,
    }
  )
  return promoteVisualHeadings(result.value)
}
