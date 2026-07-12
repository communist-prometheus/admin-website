import { computeDelta } from '../delta/calculator'
import { classifyMagazines } from '../magazine/classify'
import type { SendInput } from '../resend/types'
import type { Subscriber } from '../subscribers/types'
import { buildSendInput } from './build-input'
import type { DispatchContext } from './context'

/** A subscriber that has content this tick, plus their ready-to-send email. */
export type SendPlan = {
  readonly sub: Subscriber
  readonly input: SendInput
  readonly count: number
}

/**
 * Decide whether one subscriber gets a digest this tick, and if so
 * build their Resend payload. Skip only when there is neither a new
 * article nor a freshly-published magazine issue; a "current issue"
 * reference alone never triggers a send (it rides at the foot).
 * @param ctx Static tick-wide context.
 * @param sub The recipient.
 * @returns A send plan, or undefined when the subscriber is skipped.
 */
export const planOne = async (
  ctx: DispatchContext,
  sub: Subscriber
): Promise<SendPlan | undefined> => {
  const delta = computeDelta(sub, ctx.byLang, ctx.cutoffMs)
  const papers = classifyMagazines(sub, ctx.magazinesByLang, ctx.cutoffMs)
  if (delta.length === 0 && papers.announcements.length === 0)
    return undefined
  const count = delta.length + papers.announcements.length
  const input = await buildSendInput(ctx, sub, delta, papers)
  return { sub, input, count }
}
