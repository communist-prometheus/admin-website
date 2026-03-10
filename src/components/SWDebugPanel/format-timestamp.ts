/**
 * Format a timestamp as HH:MM:SS.mmm for log display.
 * @param ts - Unix timestamp in milliseconds
 * @returns Formatted time string
 */
export const formatTimestamp = (ts: number): string => {
  const d = new Date(ts)
  const h = String(d.getHours()).padStart(2, '0')
  const m = String(d.getMinutes()).padStart(2, '0')
  const s = String(d.getSeconds()).padStart(2, '0')
  const ms = String(d.getMilliseconds()).padStart(3, '0')
  return `${h}:${m}:${s}.${ms}`
}
