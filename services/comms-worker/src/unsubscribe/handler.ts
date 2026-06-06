import type { SubscriberRepo } from '../subscribers/repo'
import { verifyUnsubscribeToken } from './token'

/** Outcomes of the public unsubscribe verify+flip pipeline. */
export type UnsubscribeOutcome =
  | { readonly kind: 'unsubscribed' }
  | { readonly kind: 'already' }
  | { readonly kind: 'invalid' }

/**
 * Verify the token, look up the subscriber, and (only when active)
 * flip status to `unsubscribed`. Already-unsubscribed rows return
 * `already` so the route can keep its 200-idempotent contract (R4.4).
 * @param repo Subscriber repo bound to the current request's D1.
 * @param secret Shared UNSUBSCRIBE_SECRET used to verify the token.
 * @param token Raw `t` query parameter, possibly undefined.
 * @returns Discriminated outcome consumed by the route renderer.
 */
export const verifyAndFlip = async (
  repo: SubscriberRepo,
  secret: string,
  token: string | undefined
): Promise<UnsubscribeOutcome> => {
  if (token === undefined || token === '') return { kind: 'invalid' }
  const verified = await verifyUnsubscribeToken(token, secret)
  if (verified === undefined) return { kind: 'invalid' }
  const found = await repo.findById(verified.id)
  if (found === undefined) return { kind: 'invalid' }
  if (found.status !== 'active') return { kind: 'already' }
  await repo.setStatus(verified.id, 'unsubscribed')
  return { kind: 'unsubscribed' }
}
