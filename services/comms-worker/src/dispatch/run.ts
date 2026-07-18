import { logEvent } from '../log/structured'
import type { QuotaKind } from '../resend/response'
import { advanceCutoff } from './cutoff-cycle'
import { resumeAt } from './pause-window'
import { planOne, type SendPlan } from './plan'
import { finishTick } from './run-finish'
import { prepareDispatch } from './run-prepare'
import { sendInBatches } from './send-batches'
import type { DispatchSummary, RunDispatchDeps } from './types'

const isPlan = (p: SendPlan | undefined): p is SendPlan => p !== undefined

/**
 * Pause the dispatch until the exhausted quota resets, so the cron
 * stops re-attempting a send that can only fail until then. Returns the
 * resume instant for the summary + report.
 * @param d Dispatch deps.
 * @param quota The quota Resend reported exhausted.
 * @returns ISO resume instant.
 */
const pauseForQuota = async (
  d: RunDispatchDeps,
  quota: QuotaKind
): Promise<string> => {
  const until = resumeAt(quota, d.tickAt).toISOString()
  await d.settingsRepo.setPausedUntil(until)
  logEvent('dispatch.paused', { quota, until })
  return until
}

/**
 * Execute one dispatch tick: load the shared cutoff, fetch RSS per
 * unique lang once, build the digest for every subscriber with new
 * content, then send them through the Resend BATCH endpoint (≤100 per
 * HTTP call — no per-second rate-limit burst). The shared cutoff is
 * advanced to `tickAt` ONLY on a clean tick (something went out and
 * nothing failed), so a partial failure replays next tick instead of
 * stranding the failed recipients past the watermark. Finally report the
 * run and sweep old send_log rows. Side-effect-free except through the
 * injected deps.
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
  const { sent, failed, quota } = await sendInBatches(ctx, plans)
  const clean = plans.length > 0 && failed === 0 && d.targetIds === undefined
  await advanceCutoff(d, clean)
  const pausedUntil =
    quota === undefined ? undefined : await pauseForQuota(d, quota)
  const skipped = subs.length - plans.length
  await finishTick(d, skipped, pausedUntil)
  const result: DispatchSummary = {
    sent,
    failed,
    skipped,
    durationMs: Date.now() - start,
    ...(pausedUntil ? { pausedUntil } : {}),
  }
  logEvent('tick.done', { ...result })
  return result
}
