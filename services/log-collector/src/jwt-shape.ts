import type { JwtPayload } from './jwt-types'

/**
 * Type guard for the decoded JWT payload shape. Used in
 * `verifyJwt` after `JSON.parse` to fail fast on malformed input
 * without sprinkling `as` assertions.
 * @param value Result of `JSON.parse`.
 * @returns True when value matches `JwtPayload`.
 */
export const isJwtPayload = (value: unknown): value is JwtPayload => {
  const v = value as Record<string, unknown>
  return (
    value !== null &&
    typeof value === 'object' &&
    typeof v['sub'] === 'string' &&
    typeof v['aud'] === 'string' &&
    typeof v['iat'] === 'number' &&
    typeof v['exp'] === 'number'
  )
}
