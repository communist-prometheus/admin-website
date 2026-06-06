import type { Subscriber } from '../subscribers/types'
import type { DispatchContext } from './context'

/** Persist a successful send: stamp `last_sent_at` + log row. */
export const recordSent = async (
  ctx: DispatchContext,
  sub: Subscriber,
  articleCount: number,
  resendId: string
): Promise<void> => {
  await ctx.subscriberRepo.markSent(sub.id, ctx.tickAt.toISOString())
  await ctx.sendLogRepo.append({
    subscriberId: sub.id,
    tickAt: ctx.tickAt.toISOString(),
    articleCount,
    status: 'sent',
    resendId,
    error: undefined,
  })
}

/** Persist a failed send: log row only, leave `last_sent_at` untouched. */
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
