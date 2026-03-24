/**
 * Extract a single string from a Vue route query value.
 * Route query values can be string, null, or string[].
 * @param value - Raw query parameter value
 * @returns First string value or undefined
 */
export const extractString = (
  value: string | null | undefined | (string | null)[]
): string | undefined => {
  if (typeof value === 'string') return value
  if (Array.isArray(value)) {
    const first = value[0]
    return typeof first === 'string' ? first : undefined
  }
  return undefined
}
