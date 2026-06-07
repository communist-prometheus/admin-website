import { base64urlDecode } from './base64url'
import { importHs256Key } from './hmac-key'

/**
 * Verify the HMAC-SHA256 signature attached to `data`. Kept narrow
 * so the verify path stays linear — the only cryptography in the
 * comms-worker auth surface.
 * @param data Unsigned `<head>.<body>` portion of the JWT.
 * @param signature Base64url-encoded signature segment.
 * @param secret HS256 secret (shared with auth-worker).
 * @returns True iff the signature matches.
 */
export const checkSignature = async (
  data: string,
  signature: string,
  secret: string
): Promise<boolean> => {
  const key = await importHs256Key(secret)
  return globalThis.crypto.subtle.verify(
    'HMAC',
    key,
    base64urlDecode(signature),
    new TextEncoder().encode(data)
  )
}
