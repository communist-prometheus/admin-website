import { base64urlDecode } from './base64url'
import { importHs256Key } from './jwt-key'
import { isJwtPayload } from './jwt-shape'
import { JWT_AUDIENCE, type JwtPayload } from './jwt-types'

const checkSignature = async (
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

/**
 * Verify an HS256 JWT and return the decoded payload when valid.
 * Returns undefined for any failure (bad shape, bad signature,
 * wrong audience, expired).
 * @param token Compact-serialised JWT.
 * @param secret HS256 verification secret.
 * @returns Decoded payload or undefined.
 */
export const verifyJwt = async (
  token: string,
  secret: string
): Promise<JwtPayload | undefined> => {
  const parts = token.split('.')
  const [head, body, sig] = parts
  const data = `${head}.${body}`
  const validSig =
    parts.length === 3 && (await checkSignature(data, sig ?? '', secret))
  const decoded = validSig
    ? (JSON.parse(
        new TextDecoder().decode(base64urlDecode(body ?? ''))
      ) as unknown)
    : undefined
  const now = Math.floor(Date.now() / 1000)
  return isJwtPayload(decoded) &&
    decoded.aud === JWT_AUDIENCE &&
    decoded.exp > now
    ? decoded
    : undefined
}
