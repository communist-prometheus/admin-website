import { matchesTick } from '../cron/matcher'
import { logEvent } from '../log/structured'
import { createSettingsRepo, type SettingsRepo } from '../settings/repo'
import { buildRuntimeDeps } from './build-deps'
import { runDispatch } from './run'
import type { DispatchEnv } from './runtime-env'
import type { DispatchSummary } from './types'

export type { DispatchEnv as ScheduledEnv } from './runtime-env'

/** Dispatcher seam injected by tests. */
export type Dispatcher = (
  env: DispatchEnv,
  tickAt: Date
) => Promise<DispatchSummary>

/** Options consumed by {@link handleScheduled}. */
export type HandleScheduledOptions = {
  readonly dispatcher?: Dispatcher
}

const defaultDispatcher: Dispatcher = (env, tickAt) =>
  runDispatch(buildRuntimeDeps(env, tickAt))

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
 * Cron handler: load the saved schedule, decide whether this tick is
 * one the editor asked for, and (only then) fire the dispatch loop.
 * @param event CF ScheduledEvent-shaped object (`scheduledTime` ms).
 * @param env Worker bindings + secrets.
 * @param opts Optional dispatcher seam for unit tests.
 * @returns The dispatch summary on match, `undefined` on no-match.
 */
export const handleScheduled = async (
  event: { readonly scheduledTime: number },
  env: DispatchEnv,
  opts: HandleScheduledOptions = {}
): Promise<DispatchSummary | undefined> => {
  const tickAt = new Date(event.scheduledTime)
  const settings = createSettingsRepo({ db: env.DB })
  const sched = await settings.getSchedule(tickAt)
  if (sched === undefined) {
    logEvent('tick.match', { matched: false, reason: 'no-schedule' })
    return undefined
  }
  const matched = matchesTick(sched, tickAt)
  logEvent('tick.match', {
    matched,
    schedule: sched.cron,
    timezone: sched.timezone,
  })
  if (!matched) return undefined
  if (await isPaused(settings, tickAt)) {
    logEvent('tick.paused', { until: await settings.getPausedUntil() })
    return undefined
  }
  const run = opts.dispatcher ?? defaultDispatcher
  return run(env, tickAt)
}
