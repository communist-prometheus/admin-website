const PROLOG_BYTES = 200

const declaredEncoding = (head: string): string =>
  head.match(/encoding=["']([^"']+)["']/i)?.[1] ?? 'utf-8'

const decode = (buf: ArrayBuffer, encoding: string): string => {
  try {
    return new TextDecoder(encoding).decode(buf)
  } catch {
    return new TextDecoder('utf-8').decode(buf)
  }
}

/**
 * Read an FB2 File as text, honouring the encoding declared in its XML
 * prolog (older Russian FB2s are often windows-1251) instead of blindly
 * assuming UTF-8 — a wrong guess mojibakes Cyrillic on commit.
 *
 * @param file - The uploaded `.fb2` File.
 * @returns The file decoded with its declared (or UTF-8) encoding.
 */
export const readFb2Text = async (file: File): Promise<string> => {
  const buf = await file.arrayBuffer()
  const head = new TextDecoder('ascii').decode(
    new Uint8Array(buf, 0, Math.min(PROLOG_BYTES, buf.byteLength))
  )
  return decode(buf, declaredEncoding(head))
}
