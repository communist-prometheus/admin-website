import type { Subscriber } from '../subscribers/types'
import type { DispatchContext } from './context'

/**
 * Persist a successful send: append a `send_log` row and stamp the
 * subscriber's `last_sent_at`. The shared `settings.cutoff_at`
 * watermark is advanced once per tick by the orchestrator (see
 * `run.ts`), not per-recipient.
 *
 * `last_sent_at` has existed since the first migration but nothing ever
 * wrote it, so every row read `null` and the admin could not show when
 * an address was last mailed.
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
  const tickAt = ctx.tickAt.toISOString()
  await Promise.all([
    ctx.sendLogRepo.append({
      subscriberId: sub.id,
      tickAt,
      articleCount,
      status: 'sent',
      resendId,
      error: undefined,
    }),
    ctx.subscriberRepo.markSent(sub.id, tickAt),
  ])
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
