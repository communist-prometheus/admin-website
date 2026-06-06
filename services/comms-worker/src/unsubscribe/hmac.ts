import { base64urlEncode } from '../auth/base64url'

const KEY_USAGE: ReadonlyArray<KeyUsage> = ['sign']

const importHmacKey = (secret: string): Promise<CryptoKey> =>
  crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    [...KEY_USAGE]
  )

/**
 * Compute the base64url HMAC-SHA256 signature of `message` under `secret`.
 * @param secret Shared secret key.
 * @param message UTF-8 message bytes.
 * @returns Base64url-encoded signature.
 */
export const hmacSignBase64url = async (
  secret: string,
  message: string
): Promise<string> => {
  const key = await importHmacKey(secret)
  const sig = await crypto.subtle.sign(
    'HMAC',
    key,
    new TextEncoder().encode(message)
  )
  return base64urlEncode(sig)
}

/**
 * Constant-time string comparison: returns true iff `a` and `b` carry the
 * same bytes. Always reads the longer string in full so timing leaks no
 * information about which byte differed.
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
