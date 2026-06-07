import { base64urlDecode } from './base64url'
import { isSessionClaims } from './claims-guard'
import { checkSignature } from './signature'
import { JWT_AUDIENCE, JWT_ISSUER, type SessionClaims } from './types'

const decodeBody = (body: string | undefined): unknown => {
  try {
    return JSON.parse(new TextDecoder().decode(base64urlDecode(body ?? '')))
  } catch {
    return undefined
  }
}

/** Optional clock injection for tests. */
export type VerifyOpts = {
  readonly secret: string
  readonly now?: () => number
}

/**
 * Verify an SSO JWT and return the decoded claims on success.
 * Returns undefined for any failure mode (bad shape, bad signature,
 * wrong audience/issuer, expired). Never throws on untrusted input.
 * @param token Compact-serialised JWT.
 * @param opts Secret + optional clock for tests.
 * @returns Decoded session claims, or undefined.
 */
export const verifySessionJwt = async (
  token: string,
  opts: VerifyOpts
): Promise<SessionClaims | undefined> => {
  const parts = token.split('.')
  if (parts.length !== 3) return undefined
  const [head, body, sig] = parts
  const data = `${head}.${body}`
  const validSig = await checkSignature(data, sig ?? '', opts.secret).catch(
    () => false
  )
  if (!validSig) return undefined
  const decoded = decodeBody(body)
  if (!isSessionClaims(decoded)) return undefined
  const nowSec = Math.floor((opts.now ?? (() => Date.now()))() / 1000)
  return decoded.aud === JWT_AUDIENCE &&
    decoded.iss === JWT_ISSUER &&
    decoded.exp > nowSec
    ? decoded
    : undefined
}
