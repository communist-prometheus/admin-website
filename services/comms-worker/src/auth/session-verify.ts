import { base64urlDecode } from './base64url'
import { importHs256Key } from './hmac-key'
import {
  JWT_AUDIENCE,
  JWT_ISSUER,
  type SessionClaims,
} from './session-types'

const isObject = (x: unknown): x is Record<string, unknown> =>
  x !== null && typeof x === 'object'

const isStringArray = (x: unknown): x is readonly string[] =>
  Array.isArray(x) && x.every(item => typeof item === 'string')

const isSessionClaims = (value: unknown): value is SessionClaims => {
  if (!isObject(value)) return false
  return (
    typeof value['sub'] === 'string' &&
    typeof value['login'] === 'string' &&
    isStringArray(value['teams']) &&
    typeof value['iat'] === 'number' &&
    typeof value['exp'] === 'number' &&
    typeof value['aud'] === 'string' &&
    typeof value['iss'] === 'string'
  )
}

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

/** Optional clock injection for tests. */
export type VerifyOpts = {
  readonly secret: string
  readonly now?: () => number
}

/**
 * Verify an SSO JWT issued by auth-worker. Returns the decoded
 * claims on success or undefined for any failure mode (bad shape,
 * bad signature, wrong audience/issuer, expired). Never throws on
 * untrusted input.
 * @param token Compact-serialised JWT from `comprom_session` cookie.
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
  const decoded = ((): unknown => {
    try {
      return JSON.parse(new TextDecoder().decode(base64urlDecode(body ?? '')))
    } catch {
      return undefined
    }
  })()
  if (!isSessionClaims(decoded)) return undefined
  const nowSec = Math.floor((opts.now ?? (() => Date.now()))() / 1000)
  return decoded.aud === JWT_AUDIENCE &&
    decoded.iss === JWT_ISSUER &&
    decoded.exp > nowSec
    ? decoded
    : undefined
}
