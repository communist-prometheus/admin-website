import { fetchLatestIssues } from '../magazine/fetch-issues'
import type { Subscriber } from '../subscribers/types'
import type { DispatchContext } from './context'
import { loadCutoffMs } from './cutoff-cycle'
import { fetchAllLangs } from './fetch-articles'
import { buildCtx, selectRecipients } from './run-helpers'
import type { RunDispatchDeps } from './types'

/** The materialised context plus the recipients it will dispatch to. */
export type Prepared = {
  readonly ctx: DispatchContext
  readonly subs: ReadonlyArray<Subscriber>
}

/**
 * Load the tick inputs once: the active list (narrowed to any target
 * ids), the cutoff, and the RSS + magazine feeds for the recipients'
 * languages, then materialise the shared dispatch context.
 * @param d Injected dependencies.
 * @returns The dispatch context and the recipients to send to.
 */
export const prepareDispatch = async (
  d: RunDispatchDeps
): Promise<Prepared> => {
  const [active, cutoffMs] = await Promise.all([
    d.subscriberRepo.listActive(),
    loadCutoffMs(d),
  ])
  const subs = selectRecipients(active, d.targetIds)
  const [byLang, magazinesByLang] = await Promise.all([
    fetchAllLangs(subs, d.rss),
    fetchLatestIssues(subs, d.magazine),
  ])
  return { ctx: buildCtx(d, byLang, magazinesByLang, cutoffMs), subs }
}
