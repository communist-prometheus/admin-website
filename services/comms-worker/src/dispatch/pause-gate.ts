import { logEvent } from '../log/structured'
import type { SettingsRepo } from '../settings/repo'

/**
 * Whether this tick is still inside a quota pause. A pause set on a
 * `daily_quota_exceeded` holds every tick until the quota resets; once
 * `tickAt` reaches it the pause is dropped and the tick proceeds, so
 * the deferred recipients replay on the first tick after the reset.
 * @param repo Settings repo bound to this tick's DB.
 * @param tickAt The tick moment.
 * @returns True when the dispatch is still paused (skip this tick).
 */
const isPaused = async (
  repo: SettingsRepo,
  tickAt: Date
): Promise<boolean> => {
  const until = await repo.getPausedUntil()
  if (until === undefined) return false
  const untilMs = Date.parse(until)
  if (Number.isFinite(untilMs) && tickAt.getTime() < untilMs) return true
  await repo.clearPausedUntil()
  return false
}

/**
 * Gate a matched tick on the quota pause: logs and returns false when the
 * dispatch is still paused for this tick, true when it may proceed.
 * @param repo Settings repo bound to this tick's DB.
 * @param tickAt The tick moment.
 * @returns True when the tick may dispatch.
 */
export const mayDispatch = async (
  repo: SettingsRepo,
  tickAt: Date
): Promise<boolean> => {
  if (!(await isPaused(repo, tickAt))) return true
  logEvent('tick.paused', { until: await repo.getPausedUntil() })
  return false
}
