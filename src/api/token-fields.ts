/** Only the PKCE exchange fields — nothing else passes through. */
export const FORWARDED: readonly string[] = [
  'code',
  'redirect_uri',
  'code_verifier',
]

/** Only the documented token-response fields reach the browser. */
export const RETURNED: readonly string[] = [
  'access_token',
  'token_type',
  'scope',
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
