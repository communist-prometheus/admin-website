import { type Digest, renderDigest } from '../digest/render'
import type { NewspaperSelection } from '../newspaper/classify'
import type { SendInput } from '../resend/types'
import type { Article } from '../rss/types'
import type { Subscriber } from '../subscribers/types'
import { signUnsubscribeToken } from '../unsubscribe/token'
import type { DispatchContext } from './context'

const toSendInput = (
  ctx: DispatchContext,
  sub: Subscriber,
  d: Digest
): SendInput => ({
  from: ctx.fromAddress,
  to: sub.email,
  subject: d.subject,
  html: d.html,
  text: d.text,
  headers: {
    'List-Unsubscribe': d.listUnsubscribe,
    'List-Unsubscribe-Post': d.listUnsubscribePost,
  },
  idempotencyKey: `${sub.id}:${ctx.tickAt.toISOString()}`,
})

/**
 * Build the Resend `SendInput` payload for one subscriber + their delta.
 * Signs the unsubscribe token, renders the digest, sets the
 * idempotency key.
 * @param ctx Static tick-wide context.
 * @param sub The recipient.
 * @param delta Articles the subscriber will receive.
 * @param newspapers Newspaper issues split into announcements + current.
 * @returns Fully-populated Resend send input.
 */
export const buildSendInput = async (
  ctx: DispatchContext,
  sub: Subscriber,
  delta: ReadonlyArray<Article>,
  newspapers: NewspaperSelection
): Promise<SendInput> => {
  const token = await signUnsubscribeToken(sub.id, ctx.secret)
  const url = `${ctx.publicBaseUrl}/unsubscribe?t=${token}`
  const d = renderDigest({
    subscriber: sub,
    articles: delta,
    newspapers,
    unsubscribeUrl: url,
    tickAt: ctx.tickAt,
  })
  return toSendInput(ctx, sub, d)
}
