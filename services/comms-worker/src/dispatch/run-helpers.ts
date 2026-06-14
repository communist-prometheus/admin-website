import type { IssuesByLang } from '../newspaper/fetch'
import type { DispatchContext } from './context'
import type { DispatchOutcome } from './dispatch-one'
import type { ArticlesByLang } from './fetch-articles'
import type { DispatchSummary, RunDispatchDeps } from './types'

const MS_PER_DAY = 86_400_000

/**
 * Compute the retention cutoff ISO — `tickAt - retentionDays`. Used
 * by the orchestrator to sweep `send_log` rows older than the window.
 * @param tickAt Tick moment.
 * @param days Retention window in days.
 * @returns ISO string of the cutoff moment.
 */
export const retentionCutoffIso = (tickAt: Date, days: number): string =>
  new Date(tickAt.getTime() - days * MS_PER_DAY).toISOString()

/**
 * Roll up per-recipient outcomes into the tick summary returned to
 * the worker entrypoint.
 * @param outcomes Per-recipient outcome list.
 * @param durationMs Wall-clock duration of the tick.
 * @returns Tick summary `{sent, failed, skipped, durationMs}`.
 */
export const summarise = (
  outcomes: ReadonlyArray<DispatchOutcome>,
  durationMs: number
): DispatchSummary => ({
  sent: outcomes.filter(o => o === 'sent').length,
  failed: outcomes.filter(o => o === 'failed').length,
  skipped: outcomes.filter(o => o === 'skipped').length,
  durationMs,
})

/**
 * Materialise the per-tick context handed to every `dispatchOne`
 * call — bundles the static deps with the already-fetched articles
 * and the resolved cutoff.
 * @param d Dispatch deps.
 * @param byLang Articles grouped by language for the tick.
 * @param newspapersByLang Latest newspaper issue per language for the tick.
 * @param cutoffMs Resolved cutoff (undefined = no cutoff yet).
 * @returns DispatchContext.
 */
export const buildCtx = (
  d: RunDispatchDeps,
  byLang: ArticlesByLang,
  newspapersByLang: IssuesByLang,
  cutoffMs: number | undefined
): DispatchContext => ({
  subscriberRepo: d.subscriberRepo,
  sendLogRepo: d.sendLogRepo,
  resend: d.resend,
  secret: d.secret,
  fromAddress: d.fromAddress,
  publicBaseUrl: d.publicBaseUrl,
  tickAt: d.tickAt,
  byLang,
  newspapersByLang,
  cutoffMs,
})
