import type { IssuesByLang } from '../magazine/fetch'
import type { Subscriber } from '../subscribers/types'
import type { DispatchContext } from './context'
import type { ArticlesByLang } from './fetch-articles'
import type { RunDispatchDeps } from './types'

const MS_PER_DAY = 86_400_000

/**
 * Narrow the active list to a targeted recipient set. Returns the
 * full list unchanged when no target ids are supplied (the scheduled
 * path); otherwise keeps only subscribers whose id is selected.
 * @param active Active subscribers for the tick.
 * @param targetIds Selected ids, or undefined for "everyone".
 * @returns The subscribers to dispatch.
 */
export const selectRecipients = (
  active: ReadonlyArray<Subscriber>,
  targetIds: ReadonlyArray<number> | undefined
): ReadonlyArray<Subscriber> => {
  if (targetIds === undefined) return active
  const wanted = new Set(targetIds)
  return active.filter(s => wanted.has(s.id))
}

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
 * Materialise the per-tick context handed to the planner / batch
 * sender — bundles the static deps with the already-fetched articles
 * and the resolved cutoff.
 * @param d Dispatch deps.
 * @param byLang Articles grouped by language for the tick.
 * @param magazinesByLang Latest magazine issue per language for the tick.
 * @param cutoffMs Resolved cutoff (undefined = no cutoff yet).
 * @returns DispatchContext.
 */
export const buildCtx = (
  d: RunDispatchDeps,
  byLang: ArticlesByLang,
  magazinesByLang: IssuesByLang,
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
  magazinesByLang,
  cutoffMs,
})
