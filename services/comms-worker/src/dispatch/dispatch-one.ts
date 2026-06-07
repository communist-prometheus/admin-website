import { computeDelta } from '../delta/calculator'
import type { Subscriber } from '../subscribers/types'
import { buildSendInput } from './build-input'
import type { DispatchContext } from './context'
import { recordFailed, recordSent } from './record'

/** Outcome of dispatching a single subscriber. */
export type DispatchOutcome = 'sent' | 'failed' | 'skipped'

/**
 * Dispatch one subscriber for the given tick: compute the delta,
 * skip on empty, otherwise render + send + log per design §3.2.
 * @param ctx Static tick-wide context.
 * @param sub The recipient.
 * @returns Outcome label used by the orchestrator summary.
 */
export const dispatchOne = async (
  ctx: DispatchContext,
  sub: Subscriber
): Promise<DispatchOutcome> => {
  const delta = computeDelta(sub, ctx.byLang, ctx.cutoffMs)
  if (delta.length === 0) return 'skipped'
  const result = await ctx.resend.send(await buildSendInput(ctx, sub, delta))
  if (result.ok) {
    await recordSent(ctx, sub, delta.length, result.id)
    return 'sent'
  }
  await recordFailed(ctx, sub, delta.length, result.error)
  return 'failed'
}
