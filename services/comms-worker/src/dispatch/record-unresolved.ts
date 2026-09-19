import type { Subscriber } from '../subscribers/types'
import type { DispatchContext } from './context'

/**
 * Persist an UNRESOLVED send: the batch was still being processed when
 * the retry budget ran out, so nothing is known to have gone wrong and
 * nothing is known to have arrived. Recorded as `skipped` rather than
 * `failed` so the journal does not report a red run for mail that may
 * have been delivered, and so a "resend to failed" never targets it.
 * Like a failure it moves no watermark, so the next tick replays it.
 * @param ctx Per-tick dispatch context.
 * @param sub Recipient.
 * @param articleCount Number of articles in the attempted digest.
 * @param error The last status Resend answered, for diagnostics.
 */
export const recordUnresolved = async (
  ctx: DispatchContext,
  sub: Subscriber,
  articleCount: number,
  error: string
): Promise<void> => {
  await ctx.sendLogRepo.append({
    subscriberId: sub.id,
    tickAt: ctx.tickAt.toISOString(),
    articleCount,
    status: 'skipped',
    resendId: undefined,
    error,
  })
}
