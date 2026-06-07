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
 * Advance the global cutoff to the tick moment when at least one
 * recipient was successfully sent. No-op when nothing went out, so a
 * retry on the next tick can still pick up the same articles.
 * @param d Dispatch deps.
 * @param anySent Whether any outcome in the tick was `sent`.
 */
export const advanceCutoff = async (
  d: RunDispatchDeps,
  anySent: boolean
): Promise<void> => {
  if (!anySent) return
  await d.settingsRepo.setCutoffAt(d.tickAt.toISOString())
}
