import mammoth from 'mammoth'

/**
 * Convert a .docx ArrayBuffer to HTML via mammoth. Embedded images are
 * emitted as inline base64 data URIs; callers extract those later.
 *
 * @param buffer raw .docx bytes
 * @returns mammoth HTML string
 */
export const convertDocxToHtml = async (
  buffer: ArrayBuffer
): Promise<string> => {
  const result = await mammoth.convertToHtml({ arrayBuffer: buffer })
  return result.value
}
