const MS_PER_SECOND = 1000
const SECONDS_PER_MINUTE = 60
const MINUTES_PER_HOUR = 60

/**
 * Format uptime in milliseconds to a human-readable string.
 * @param ms - Uptime in milliseconds
 * @returns Formatted string like "1h 23m 45s"
 */
export const formatUptime = (ms: number): string => {
  const totalSec = Math.floor(ms / MS_PER_SECOND)
  const h = Math.floor(totalSec / SECONDS_PER_MINUTE / MINUTES_PER_HOUR)
  const m = Math.floor(totalSec / SECONDS_PER_MINUTE) % MINUTES_PER_HOUR
  const s = totalSec % SECONDS_PER_MINUTE
  if (h > 0) return `${h}h ${m}m ${s}s`
  if (m > 0) return `${m}m ${s}s`
  return `${s}s`
}
