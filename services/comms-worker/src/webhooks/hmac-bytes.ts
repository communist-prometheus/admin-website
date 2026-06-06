const KEY_USAGE: ReadonlyArray<KeyUsage> = ['sign']

const importHmacKey = (secretBytes: Uint8Array): Promise<CryptoKey> =>
  crypto.subtle.importKey(
    'raw',
    secretBytes,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    [...KEY_USAGE]
  )

const toBase64 = (buf: ArrayBuffer): string => {
  const bytes = new Uint8Array(buf)
  const bin = Array.from(bytes, b => String.fromCharCode(b)).join('')
  return globalThis.btoa(bin)
}

/**
 * Compute the standard-base64 HMAC-SHA256 signature of `message` under
 * the given raw secret bytes. Distinct from {@link hmacSignBase64url}
 * because Svix signatures use base64 (not base64url) encoding.
 * @param secretBytes Raw secret bytes (post-base64-decode for `whsec_*`).
 * @param message UTF-8 message bytes.
 * @returns Standard base64-encoded signature.
 */
export const hmacSignBase64Bytes = async (
  secretBytes: Uint8Array,
  message: string
): Promise<string> => {
  const key = await importHmacKey(secretBytes)
  const sig = await crypto.subtle.sign(
    'HMAC',
    key,
    new TextEncoder().encode(message)
  )
  return toBase64(sig)
}

/**
 * Constant-time comparison of two same-length strings.
 * @param a First string.
 * @param b Second string.
 * @returns Whether the strings are byte-equal.
 */
export const constantTimeEqual = (a: string, b: string): boolean => {
  if (a.length !== b.length) return false
  let diff = 0
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i)
  }
  return diff === 0
}
