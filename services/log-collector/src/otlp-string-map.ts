const isObject = (x: unknown): x is Record<string, unknown> =>
  x !== null && typeof x === 'object'

/**
 * Coerce an unknown value into a string→string map. Used to
 * extract attributes from raw OTLP payloads while dropping any
 * non-string values without throwing.
 * @param value Source value (typically a parsed JSON object).
 * @returns Frozen string-to-string map.
 */
export const stringMap = (
  value: unknown
): Readonly<Record<string, string>> => {
  const obj = isObject(value) ? value : {}
  const entries = Object.entries(obj).filter(
    (entry): entry is [string, string] => typeof entry[1] === 'string'
  )
  return Object.fromEntries(entries)
}
