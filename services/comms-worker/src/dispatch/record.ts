import type { Subscriber } from '../subscribers/types'
import type { DispatchContext } from './context'

/**
 * Persist a successful send: append a `send_log` row. The shared
 * `settings.cutoff_at` watermark is advanced once per tick by the
 * orchestrator (see `run.ts`), not per-recipient.
 * @param ctx Per-tick dispatch context.
 * @param sub Recipient.
 * @param articleCount Number of articles included in the digest.
 * @param resendId Resend message id returned by the API.
 */
export const recordSent = async (
  ctx: DispatchContext,
  sub: Subscriber,
  articleCount: number,
  resendId: string
): Promise<void> => {
  await ctx.sendLogRepo.append({
    subscriberId: sub.id,
    tickAt: ctx.tickAt.toISOString(),
    articleCount,
    status: 'sent',
    resendId,
    error: undefined,
  })
}

/**
 * Persist a failed send: append a `send_log` row only. The cutoff
 * is not advanced and the subscriber is not marked sent.
 * @param ctx Per-tick dispatch context.
 * @param sub Recipient.
 * @param articleCount Number of articles in the attempted digest.
 * @param error Resend error string for diagnostics.
 */
export const recordFailed = async (
  ctx: DispatchContext,
  sub: Subscriber,
  articleCount: number,
  error: string
): Promise<void> => {
  await ctx.sendLogRepo.append({
    subscriberId: sub.id,
    tickAt: ctx.tickAt.toISOString(),
    articleCount,
    status: 'failed',
    resendId: undefined,
    error,
  })
}
