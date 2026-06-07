const fromBase64Std = (b64: string): string =>
  b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')

const toBase64Std = (b64url: string): string => {
  const padded = b64url + '='.repeat((4 - (b64url.length % 4)) % 4)
  return padded.replace(/-/g, '+').replace(/_/g, '/')
}

/**
 * Encode bytes (or a string) to base64url. Wraps `btoa` and
 * translates to the URL-safe alphabet, dropping padding.
 * @param input Bytes or UTF-8 string to encode.
 * @returns Base64url string.
 */
export const base64urlEncode = (input: ArrayBuffer | string): string => {
  const bytes =
    typeof input === 'string'
      ? new TextEncoder().encode(input)
      : new Uint8Array(input)
  const bin = Array.from(bytes, b => String.fromCharCode(b)).join('')
  return fromBase64Std(globalThis.btoa(bin))
}

/**
 * Decode a base64url string to a `Uint8Array`. Throws on
 * non-base64 input.
 * @param raw Base64url-encoded string.
 * @returns Decoded bytes.
 */
export const base64urlDecode = (raw: string): Uint8Array => {
  const std = toBase64Std(raw)
  const bin = globalThis.atob(std)
  return Uint8Array.from(bin, c => c.charCodeAt(0))
}
