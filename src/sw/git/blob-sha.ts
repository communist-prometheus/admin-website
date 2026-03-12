const encoder = new TextEncoder()

/**
 * Convert an ArrayBuffer to a hex string.
 * @param buf - Hash digest buffer
 * @returns 40-char hex string
 */
const toHex = (buf: ArrayBuffer): string =>
  Array.from(new Uint8Array(buf), b => b.toString(16).padStart(2, '0')).join(
    ''
  )

/**
 * Compute the git blob SHA-1 for a string.
 * Uses native Web Crypto — no isomorphic-git dependency.
 * Format: SHA-1("blob <size>\0<content>")
 * @param content - File content
 * @returns Git blob OID (40-char hex)
 */
export const computeBlobSha = async (content: string): Promise<string> => {
  const data = encoder.encode(content)
  const header = encoder.encode(`blob ${data.byteLength}\0`)
  const blob = new Uint8Array(header.byteLength + data.byteLength)
  blob.set(header)
  blob.set(data, header.byteLength)
  return toHex(await crypto.subtle.digest('SHA-1', blob))
}
