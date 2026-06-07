/** Pinned audience for every SSO token issued by auth-worker. */
export const JWT_AUDIENCE = 'comprom-sso'

/** Pinned issuer claim. */
export const JWT_ISSUER = 'auth.comprom.org'

/** Default token lifetime in seconds (24 hours). */
export const JWT_TTL_SECONDS = 86_400

/**
 * Decoded SSO JWT payload. `sub` and `login` are intentional
 * duplicates: `sub` is the RFC 7519 standard slot, `login` is what
 * downstream handlers care about. `teams` is the source-of-truth
 * authorisation claim — every consumer should gate on it, not on
 * `login`.
 */
export type SessionClaims = {
  readonly sub: string
  readonly login: string
  readonly teams: readonly string[]
  readonly iat: number
  readonly exp: number
  readonly aud: string
  readonly iss: string
}

/** JWT header — fixed alg+typ, validated on verify. */
export type JwtHeader = {
  readonly alg: 'HS256'
  readonly typ: 'JWT'
}
