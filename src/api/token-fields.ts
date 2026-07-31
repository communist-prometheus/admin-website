/**
 * Fields forwarded to GitHub. Covers both the PKCE authorization-code
 * exchange (`code`/`code_verifier`) and the refresh grant
 * (`grant_type=refresh_token` + `refresh_token`). Nothing else passes.
 */
export const FORWARDED: readonly string[] = [
  'code',
  'redirect_uri',
  'code_verifier',
  'grant_type',
  'refresh_token',
]

/**
 * Token-response fields relayed to the browser. Includes the
 * user-to-server expiry material (`refresh_token`, `expires_in`,
 * `refresh_token_expires_in`) so the client can renew an 8-hour
 * token instead of dying with it.
 */
export const RETURNED: readonly string[] = [
  'access_token',
  'token_type',
  'scope',
  'refresh_token',
  'expires_in',
  'refresh_token_expires_in',
  'error',
  'error_description',
]

/**
 * Collect the present string values for the given keys.
 * @param source - Lookup returning a value or undefined
 * @param keys - Keys to pick
 * @returns Object with only the defined entries
 */
export const pickFields = (
  source: (k: string) => string | undefined,
  keys: readonly string[]
): Record<string, string> =>
  Object.fromEntries(
    keys.flatMap(k => {
      const v = source(k)
      return v === undefined ? [] : [[k, v]]
    })
  )

/**
 * Narrow an unknown JSON value to a string-keyed record.
 * @param v - Parsed JSON of unknown shape
 * @returns Record view, empty when v is not an object
 */
export const toRecord = (v: unknown): Record<string, unknown> =>
  typeof v === 'object' && v !== null ? { ...v } : {}

/**
 * Coerce a JSON scalar to string. GitHub sends `expires_in` /
 * `refresh_token_expires_in` as numbers, so a string-only filter would
 * silently drop them; numbers are stringified and re-parsed client-side.
 * @param v - Parsed JSON value
 * @returns String form, or undefined for non-scalars
 */
export const asScalarString = (v: unknown): string | undefined =>
  typeof v === 'string' ? v : typeof v === 'number' ? String(v) : undefined
