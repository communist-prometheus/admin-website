import type { SessionClaims } from './session-types'

const isObject = (x: unknown): x is Record<string, unknown> =>
  x !== null && typeof x === 'object'

const isStringArray = (x: unknown): x is readonly string[] =>
  Array.isArray(x) && x.every(item => typeof item === 'string')

/**
 * Structural type guard for the decoded SSO JWT payload. Used after
 * `JSON.parse` to fail fast without sprinkling `as` assertions over
 * the verify path. Mirrors `auth-worker/src/jwt/claims-guard.ts` —
 * the two MUST agree on shape.
 * @param value Result of `JSON.parse`.
 * @returns True iff value matches the `SessionClaims` shape.
 */
export const isSessionClaims = (value: unknown): value is SessionClaims => {
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
