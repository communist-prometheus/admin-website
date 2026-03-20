/**
 * Generate a cryptographic random code verifier for PKCE.
 * @returns Base64url-encoded random string
 */
export const generateCodeVerifier = (): string => {
  const bytes = new Uint8Array(32)
  crypto.getRandomValues(bytes)
  return toBase64Url(bytes)
}

/**
 * Derive SHA-256 code challenge from a verifier.
 * @param verifier - The code verifier string
 * @returns Base64url-encoded SHA-256 hash
 */
export const generateCodeChallenge = async (
  verifier: string
): Promise<string> => {
  const encoder = new TextEncoder()
  const data = encoder.encode(verifier)
  const digest = await crypto.subtle.digest('SHA-256', data)
  return toBase64Url(new Uint8Array(digest))
}

/**
 * Encode bytes as base64url (no padding).
 * @param bytes - Raw byte array
 * @returns Base64url string
 */
const toBase64Url = (bytes: Uint8Array): string =>
  btoa(String.fromCharCode(...bytes))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')
