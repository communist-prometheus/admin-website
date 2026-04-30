/** Maximum count rendered exactly before falling back to '9+' / '99+'. */
const SINGLE_DIGIT_MAX = 9
const TWO_DIGIT_MAX = 99

/**
 * Render a notification count for the header badge. Counts above 9
 * collapse to "9+", counts above 99 collapse to "99+", and zero
 * returns an empty string so the caller can hide the badge entirely.
 * @param count Non-negative integer count of unread notifications.
 * @returns Display string for the badge or '' to hide it.
 */
export const formatCount = (count: number): string => {
  const safe = Math.max(0, Math.floor(count))
  return safe === 0
    ? ''
    : safe <= SINGLE_DIGIT_MAX
      ? String(safe)
      : safe <= TWO_DIGIT_MAX
        ? `${safe}`
        : '99+'
}
