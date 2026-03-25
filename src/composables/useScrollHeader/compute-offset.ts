/**
 * Compute new header offset based on scroll delta.
 * Offset is negative (header slides up) on scroll down,
 * zero (visible) on scroll up. Clamped to [-height, 0].
 * @param prev - Previous scroll position
 * @param curr - Current scroll position
 * @param offset - Current header offset
 * @param height - Header element height in px
 * @returns New offset value clamped to [-height, 0]
 */
export const computeOffset = (
  prev: number,
  curr: number,
  offset: number,
  height: number
): number => {
  const delta = curr - prev
  const raw = offset - delta
  return Math.max(-height, Math.min(0, raw))
}
