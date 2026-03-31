const ESTIMATED_BUILD_MS = 120_000

/**
 * Calculate time-based build progress (0-100).
 * @param startedAt - ISO date when build started
 * @returns Progress percentage clamped to 0-95
 */
export const calcProgress = (startedAt: string | undefined): number => {
  if (!startedAt) return 0
  const elapsed = Date.now() - new Date(startedAt).getTime()
  return Math.min(95, Math.round((elapsed / ESTIMATED_BUILD_MS) * 100))
}

/**
 * Format elapsed time as human-readable string.
 * @param startedAt - ISO date when build started
 * @returns Formatted elapsed time
 */
export const formatElapsed = (startedAt: string | undefined): string => {
  if (!startedAt) return ''
  const s = Math.round((Date.now() - new Date(startedAt).getTime()) / 1000)
  return s < 60 ? `${s}s` : `${Math.floor(s / 60)}m ${s % 60}s`
}
