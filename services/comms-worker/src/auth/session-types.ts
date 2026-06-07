/**
 * Constants + shape that MUST match auth-worker exactly.
 * See `services/auth-worker/src/jwt/types.ts` and
 * `docs/architecture/sso.md` §4 for the protocol spec.
 *
 * If you change either side, change both — JWTs minted under one
 * audience will not verify under another.
 */

/** Audience claim. Pinned, never per-deploy. */
export const JWT_AUDIENCE = 'comprom-sso'

/** Issuer claim. Pinned, never per-deploy. */
export const JWT_ISSUER = 'auth.comprom.org'

/** Decoded SSO session claims. */
export type SessionClaims = {
  readonly sub: string
  readonly login: string
  readonly teams: readonly string[]
  readonly iat: number
  readonly exp: number
  readonly aud: string
  readonly iss: string
}
