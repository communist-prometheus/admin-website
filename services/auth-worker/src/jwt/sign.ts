import { base64urlEncode } from './base64url'
import { importHs256Key } from './hmac-key'
import {
  JWT_AUDIENCE,
  JWT_ISSUER,
  JWT_TTL_SECONDS,
  type JwtHeader,
  type SessionClaims,
} from './types'

const HEADER: JwtHeader = { alg: 'HS256', typ: 'JWT' }

/** Inputs the signer needs from the caller — everything else is computed. */
export type SignSessionInput = {
  readonly login: string
  readonly roles: readonly string[]
  readonly secret: string
  readonly now?: () => number
  readonly ttlSeconds?: number
}

const buildPayload = (input: SignSessionInput): SessionClaims => {
  const clock = input.now ?? (() => Date.now())
  const ttl = input.ttlSeconds ?? JWT_TTL_SECONDS
  const nowSec = Math.floor(clock() / 1000)
  return {
    sub: input.login,
    login: input.login,
    roles: input.roles,
    iat: nowSec,
    exp: nowSec + ttl,
    aud: JWT_AUDIENCE,
    iss: JWT_ISSUER,
  }
}

/**
 * Sign an SSO session JWT (HS256). `iat`/`exp` come from the
 * injected clock; `aud`/`iss` are pinned by the protocol.
 * @param input Login, roles, secret, optional clock + ttl.
 * @returns Signed JWT in compact serialisation form.
 */
export const signSessionJwt = async (
  input: SignSessionInput
): Promise<string> => {
  const payload = buildPayload(input)
  const head = base64urlEncode(JSON.stringify(HEADER))
  const body = base64urlEncode(JSON.stringify(payload))
  const data = `${head}.${body}`
  const key = await importHs256Key(input.secret)
  const sig = await globalThis.crypto.subtle.sign(
    'HMAC',
    key,
    new TextEncoder().encode(data)
  )
  return `${data}.${base64urlEncode(sig)}`
}
