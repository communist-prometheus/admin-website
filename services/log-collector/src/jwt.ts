import { base64urlEncode } from './base64url'
import { importHs256Key } from './jwt-key'
import {
  JWT_AUDIENCE,
  JWT_TTL_SECONDS,
  type JwtHeader,
  type JwtPayload,
} from './jwt-types'

const HEADER: JwtHeader = { alg: 'HS256', typ: 'JWT' }

/**
 * Sign a payload as an HS256 JWT. The `iat` and `exp` claims are
 * filled automatically; callers supply only `sub` (the user
 * identifier — typically the GitHub login).
 * @param sub Subject identifier (e.g. GitHub login).
 * @param secret HS256 signing secret read from `JWT_SECRET`.
 * @returns Signed JWT in compact serialisation form.
 */
export const signJwt = async (
  sub: string,
  secret: string
): Promise<string> => {
  const now = Math.floor(Date.now() / 1000)
  const payload: JwtPayload = {
    sub,
    aud: JWT_AUDIENCE,
    iat: now,
    exp: now + JWT_TTL_SECONDS,
  }
  const head = base64urlEncode(JSON.stringify(HEADER))
  const body = base64urlEncode(JSON.stringify(payload))
  const data = `${head}.${body}`
  const key = await importHs256Key(secret)
  const sig = await globalThis.crypto.subtle.sign(
    'HMAC',
    key,
    new TextEncoder().encode(data)
  )
  return `${data}.${base64urlEncode(sig)}`
}
