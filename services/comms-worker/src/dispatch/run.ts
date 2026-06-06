import type { DispatchContext } from './context'
import { type DispatchOutcome, dispatchOne } from './dispatch-one'
import { fetchAllLangs } from './fetch-articles'
import type { DispatchSummary, RunDispatchDeps } from './types'

const MS_PER_DAY = 86_400_000
const DEFAULT_RETENTION_DAYS = 90

const cutoffIso = (tickAt: Date, days: number): string =>
  new Date(tickAt.getTime() - days * MS_PER_DAY).toISOString()

const summary = (
  outcomes: ReadonlyArray<DispatchOutcome>,
  durationMs: number
): DispatchSummary => ({
  sent: outcomes.filter(o => o === 'sent').length,
  failed: outcomes.filter(o => o === 'failed').length,
  skipped: outcomes.filter(o => o === 'skipped').length,
  durationMs,
})

/**
 * Execute one dispatch tick: load active subscribers, fetch RSS per
 * unique lang once, dispatch each subscriber, sweep old send_log rows.
 * Side-effect-free except through injected repos / Resend / RSS.
 * @param d Injected dependencies (see {@link RunDispatchDeps}).
 * @returns Per-tick counters and wall-clock duration.
 */
export const runDispatch = async (
  d: RunDispatchDeps
): Promise<DispatchSummary> => {
  const start = Date.now()
  const subs = await d.subscriberRepo.listActive()
  const byLang = await fetchAllLangs(subs, d.rss)
  const ctx: DispatchContext = {
    subscriberRepo: d.subscriberRepo,
    sendLogRepo: d.sendLogRepo,
    resend: d.resend,
    secret: d.secret,
    fromAddress: d.fromAddress,
    publicBaseUrl: d.publicBaseUrl,
    tickAt: d.tickAt,
    byLang,
  }
  const outcomes: DispatchOutcome[] = []
  for (const sub of subs) outcomes.push(await dispatchOne(ctx, sub))
  await d.sendLogRepo.purgeOlderThan(
    cutoffIso(d.tickAt, d.retentionDays ?? DEFAULT_RETENTION_DAYS)
  )
  return summary(outcomes, Date.now() - start)
}
