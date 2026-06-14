import { computeDelta } from '../delta/calculator'
import { classifyNewspapers } from '../newspaper/classify'
import type { Subscriber } from '../subscribers/types'
import { buildSendInput } from './build-input'
import type { DispatchContext } from './context'
import { recordFailed, recordSent } from './record'

/** Outcome of dispatching a single subscriber. */
export type DispatchOutcome = 'sent' | 'failed' | 'skipped'

/**
 * Dispatch one subscriber for the given tick: compute the article
 * delta and the latest newspaper issue per language. Skip only when
 * there is neither a new article nor a freshly-published issue; a new
 * issue alone is reason enough to send. A "current issue" reference
 * (already-announced) never triggers a send on its own — it rides
 * along at the foot when something else is going out.
 * @param ctx Static tick-wide context.
 * @param sub The recipient.
 * @returns Outcome label used by the orchestrator summary.
 */
export const dispatchOne = async (
  ctx: DispatchContext,
  sub: Subscriber
): Promise<DispatchOutcome> => {
  const delta = computeDelta(sub, ctx.byLang, ctx.cutoffMs)
  const papers = classifyNewspapers(sub, ctx.newspapersByLang, ctx.cutoffMs)
  if (delta.length === 0 && papers.announcements.length === 0)
    return 'skipped'
  const count = delta.length + papers.announcements.length
  const result = await ctx.resend.send(
    await buildSendInput(ctx, sub, delta, papers)
  )
  if (result.ok) {
    await recordSent(ctx, sub, count, result.id)
    return 'sent'
  }
  await recordFailed(ctx, sub, count, result.error)
  return 'failed'
}
