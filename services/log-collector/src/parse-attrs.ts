const isObject = (v: unknown): v is Record<string, unknown> =>
  v !== null && typeof v === 'object'

const isString = (v: unknown): v is string => typeof v === 'string'

const safeJson = (raw: string): unknown => {
  try {
    return JSON.parse(raw)
  } catch {
    return undefined
  }
}

/**
 * Normalise a D1 `attrs` cell into a string→string map.
 * Accepts a JSON string or an already-parsed object; drops
 * non-string values so callers can rely on the shape.
 * @param raw Raw cell value.
 * @returns Frozen attribute map.
 */
export const parseAttrs = (
  raw: unknown
): Readonly<Record<string, string>> => {
  const parsed: unknown = isString(raw) ? safeJson(raw) : (raw ?? {})
  return isObject(parsed)
    ? Object.fromEntries(
        Object.entries(parsed).filter((entry): entry is [string, string] =>
          isString(entry[1])
        )
      )
    : {}
}
