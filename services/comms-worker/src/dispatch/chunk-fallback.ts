import { logEvent } from '../log/structured'
import type { QuotaKind } from '../resend/response'
import type { DispatchContext } from './context'
import type { SendPlan } from './plan'
import { recordFailed, recordSent } from './record'

/** Per-chunk send tally. */
export type ChunkCounts = {
  readonly sent: number
  readonly failed: number
  /**
   * Recipients whose batch was still being processed when the retry
   * budget ran out. Neither delivered nor failed as far as we know.
   */
  readonly unresolved: number
  /**
   * Set when the chunk was rejected by an account-wide quota. The
   * caller stops sending further chunks and pauses the dispatch until
   * the quota resets, rather than recording every remaining recipient
   * as failed.
   */
  readonly quota?: QuotaKind
}

const sendOne = async (
  ctx: DispatchContext,
  p: SendPlan
): Promise<boolean> => {
  const res = await ctx.resend.send(p.input)
  if (res.ok) {
    await recordSent(ctx, p.sub, p.count, res.id)
    return true
  }
  await recordFailed(ctx, p.sub, p.count, res.error)
  return false
}

/**
 * Retry a definitively-rejected chunk one email at a time.
 *
 * The batch endpoint is all-or-nothing, so a single malformed or blocked
 * recipient takes the other 99 down with it and the log then blames all
 * 100 for one address's problem. Sending individually lets the healthy
 * recipients through and pins the real error on the address that caused
 * it.
 * @param ctx Per-tick context.
 * @param group The rejected chunk.
 * @returns Per-recipient tally.
 */
export const sendIndividually = async (
  ctx: DispatchContext,
  group: ReadonlyArray<SendPlan>
): Promise<ChunkCounts> => {
  logEvent('batch.fallback', { size: group.length })
  const results = await Promise.all(group.map(p => sendOne(ctx, p)))
  const sent = results.filter(Boolean).length
  return { sent, failed: results.length - sent, unresolved: 0 }
}
