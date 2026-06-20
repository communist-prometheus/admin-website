import type { RunDispatchDeps } from './types'

/**
 * Read the global cutoff watermark and convert to ms. Returns
 * undefined when no cutoff has been recorded yet (fresh install or
 * after a manual reset) or when the stored value can't be parsed.
 * @param d Dispatch deps.
 * @returns Milliseconds since epoch, or undefined.
 */
export const loadCutoffMs = async (
  d: RunDispatchDeps
): Promise<number | undefined> => {
  const iso = await d.settingsRepo.getCutoffAt()
  if (iso === undefined) return undefined
  const ms = Date.parse(iso)
  return Number.isFinite(ms) ? ms : undefined
}

/**
 * Advance the global cutoff to the tick moment, but only on a CLEAN
 * tick — something went out and nothing failed. No-op otherwise, so a
 * partial/total failure replays on the next tick instead of stranding
 * the failed recipients past the watermark.
 * @param d Dispatch deps.
 * @param clean Whether the tick sent something with zero failures.
 */
export const advanceCutoff = async (
  d: RunDispatchDeps,
  clean: boolean
): Promise<void> => {
  if (!clean) return
  await d.settingsRepo.setCutoffAt(d.tickAt.toISOString())
}
