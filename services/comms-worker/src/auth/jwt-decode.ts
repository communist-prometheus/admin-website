import { base64urlDecode } from './base64url'

/**
 * Decode a base64url-encoded JSON segment. Returns undefined on any
 * decode / parse failure so the caller can treat malformed tokens
 * uniformly.
 * @param b64u Base64url segment from a compact JWT.
 * @returns Decoded value typed as `T`, or undefined.
 */
export const decodeJson = <T>(b64u: string): T | undefined => {
  try {
    return JSON.parse(new TextDecoder().decode(base64urlDecode(b64u))) as T
  } catch {
    return undefined
  }
}

/**
 * Verify an RS256 signature over `<header>.<body>`.
 * @param head Encoded header.
 * @param body Encoded body.
 * @param sig Base64url-encoded signature.
 * @param key Imported RSA public key.
 * @returns True iff the signature verifies.
 */
export const verifyRs256 = async (
  head: string,
  body: string,
  sig: string,
  key: CryptoKey
): Promise<boolean> =>
  crypto.subtle.verify(
    'RSASSA-PKCS1-v1_5',
    key,
    base64urlDecode(sig),
    new TextEncoder().encode(`${head}.${body}`)
  )
