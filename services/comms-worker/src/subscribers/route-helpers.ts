/**
 * Parse a positive integer from a path param.
 * @param raw Raw string path parameter.
 * @returns The id, or undefined when it is not a positive integer.
 */
export const parseId = (raw: string): number | undefined => {
  const n = Number(raw)
  return Number.isFinite(n) && n > 0 ? n : undefined
}
