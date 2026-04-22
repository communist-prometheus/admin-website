const DATA_URI = /^data:(image\/[^;]+);base64,(.+)$/
const MIME_EXT: Readonly<Record<string, string>> = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/gif': 'gif',
  'image/webp': 'webp',
  'image/svg+xml': 'svg',
}

interface Extracted {
  readonly file: File
  readonly filename: string
  readonly dataUri: string
}

const toBytes = (base64: string): ArrayBuffer => {
  const binary = atob(base64)
  const buffer = new ArrayBuffer(binary.length)
  const bytes = new Uint8Array(buffer)
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i)
  return buffer
}

/**
 * Extract `<img src="data:...">` images from an HTML string and
 * return them as Files plus the original data URIs so callers can
 * rewrite the HTML.
 *
 * @param html HTML string containing inline-image <img> tags
 * @param prefix filename prefix, e.g. `docx`
 * @returns list of extracted images ready for asset upload
 */
export const extractImages = (
  html: string,
  prefix: string
): readonly Extracted[] => {
  const out: Extracted[] = []
  const re = /<img\s[^>]*src="([^"]+)"[^>]*>/gi
  let match: RegExpExecArray | null = re.exec(html)
  while (match !== null) {
    const src = match[1] ?? ''
    const m = DATA_URI.exec(src)
    if (m) {
      const ext = MIME_EXT[m[1] ?? ''] ?? 'png'
      const filename = `${prefix}-${out.length + 1}.${ext}`
      const file = new File([toBytes(m[2] ?? '')], filename, {
        type: m[1],
      })
      out.push({ file, filename, dataUri: src })
    }
    match = re.exec(html)
  }
  return out
}
