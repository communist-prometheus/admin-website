import { logEvent } from '../log/structured'
import { advanceCutoff } from './cutoff-cycle'
import { planOne, type SendPlan } from './plan'
import { retentionCutoffIso } from './run-helpers'
import { prepareDispatch } from './run-prepare'
import { sendInBatches } from './send-batches'
import type { DispatchSummary, RunDispatchDeps } from './types'

const DEFAULT_RETENTION_DAYS = 90

const isPlan = (p: SendPlan | undefined): p is SendPlan => p !== undefined

/**
 * Execute one dispatch tick: load the shared cutoff, fetch RSS per
 * unique lang once, build the digest for every subscriber with new
 * content, then send them through the Resend BATCH endpoint (≤100 per
 * HTTP call — no per-second rate-limit burst). The shared cutoff is
 * advanced to `tickAt` ONLY on a clean tick (something went out and
 * nothing failed), so a partial failure replays next tick instead of
 * stranding the failed recipients past the watermark. Finally sweep old
 * send_log rows. Side-effect-free except through the injected deps.
 * @param d Injected dependencies (see {@link RunDispatchDeps}).
 * @returns Per-tick counters and wall-clock duration.
 */
export const runDispatch = async (
  d: RunDispatchDeps
): Promise<DispatchSummary> => {
  const start = Date.now()
  logEvent('tick.start', { tickAt: d.tickAt.toISOString() })
  const { ctx, subs } = await prepareDispatch(d)
  const plans = (await Promise.all(subs.map(s => planOne(ctx, s)))).filter(
    isPlan
  )
  const { sent, failed } = await sendInBatches(ctx, plans)
  const clean = plans.length > 0 && failed === 0 && d.targetIds === undefined
  await advanceCutoff(d, clean)
  await d.sendLogRepo.purgeOlderThan(
    retentionCutoffIso(d.tickAt, d.retentionDays ?? DEFAULT_RETENTION_DAYS)
  )
  const result: DispatchSummary = {
    sent,
    failed,
    skipped: subs.length - plans.length,
    durationMs: Date.now() - start,
  }
  logEvent('tick.done', { ...result })
  return result
}
