import { logEvent } from '../log/structured'
import { advanceCutoff } from './cutoff-cycle'
import { type DispatchOutcome, dispatchOne } from './dispatch-one'
import { retentionCutoffIso, summarise } from './run-helpers'
import { prepareDispatch } from './run-prepare'
import type { DispatchSummary, RunDispatchDeps } from './types'

const DEFAULT_RETENTION_DAYS = 90

/**
 * Execute one dispatch tick: load the shared cutoff, fetch RSS per
 * unique lang once, dispatch each subscriber against the cutoff,
 * advance the cutoff to `tickAt` if at least one send succeeded,
 * then sweep old send_log rows. Side-effect-free except through the
 * injected repos / Resend / RSS.
 * @param d Injected dependencies (see {@link RunDispatchDeps}).
 * @returns Per-tick counters and wall-clock duration.
 */
export const runDispatch = async (
  d: RunDispatchDeps
): Promise<DispatchSummary> => {
  const start = Date.now()
  logEvent('tick.start', { tickAt: d.tickAt.toISOString() })
  const { ctx, subs } = await prepareDispatch(d)
  const outcomes: DispatchOutcome[] = []
  for (const sub of subs) outcomes.push(await dispatchOne(ctx, sub))
  const advanced = d.targetIds === undefined && outcomes.includes('sent')
  await advanceCutoff(d, advanced)
  await d.sendLogRepo.purgeOlderThan(
    retentionCutoffIso(d.tickAt, d.retentionDays ?? DEFAULT_RETENTION_DAYS)
  )
  const result = summarise(outcomes, Date.now() - start)
  logEvent('tick.done', { ...result })
  return result
}
