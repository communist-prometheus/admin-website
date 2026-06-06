import { matchesTick } from '../cron/matcher'
import { createSettingsRepo } from '../settings/repo'
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
  const sched = await createSettingsRepo({ db: env.DB }).getSchedule(tickAt)
  if (sched === undefined) return undefined
  if (!matchesTick(sched, tickAt)) return undefined
  const run = opts.dispatcher ?? defaultDispatcher
  return run(env, tickAt)
}
