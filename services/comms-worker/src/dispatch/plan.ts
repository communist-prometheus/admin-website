import { computeDelta } from '../delta/calculator'
import { classifyMagazines } from '../magazine/classify'
import type { SendInput } from '../resend/types'
import type { Subscriber } from '../subscribers/types'
import { buildSendInput } from './build-input'
import type { DispatchContext } from './context'
import { subscriberCutoffMs } from './subscriber-cutoff'

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
 *
 * "New" is measured against THIS address's own watermark
 * (`last_sent_at`), not a boundary shared by the whole list — see
 * {@link subscriberCutoffMs}.
 * @param ctx Static tick-wide context.
 * @param sub The recipient.
 * @returns A send plan, or undefined when the subscriber is skipped.
 */
export const planOne = async (
  ctx: DispatchContext,
  sub: Subscriber
): Promise<SendPlan | undefined> => {
  const cutoff = subscriberCutoffMs(sub, ctx.cutoffMs)
  const delta = computeDelta(sub, ctx.byLang, cutoff)
  const papers = classifyMagazines(sub, ctx.magazinesByLang, cutoff)
  if (delta.length === 0 && papers.announcements.length === 0)
    return undefined
  const count = delta.length + papers.announcements.length
  const input = await buildSendInput(ctx, sub, delta, papers)
  return { sub, input, count }
}
