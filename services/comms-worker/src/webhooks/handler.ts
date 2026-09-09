import type { SendLogRepo } from '../send-log/repo'
import type { SendLogStatus } from '../send-log/types'
import type { SubscriberRepo } from '../subscribers/repo'
import type { SubscriberStatus } from '../subscribers/types'

const STATUS_MAP: Readonly<
  Record<string, { sub: SubscriberStatus; log: SendLogStatus } | undefined>
> = {
  'email.bounced': { sub: 'bounced', log: 'bounced' },
  'email.delivery_delayed': { sub: 'bounced', log: 'bounced' },
  'email.complained': { sub: 'complained', log: 'complained' },
}

/** Minimum shape we read from the Resend event body. */
export type ResendEvent = {
  readonly type: string
  readonly data?: { readonly email_id?: string }
}

/**
 * Apply a verified Resend webhook event: look the original send up by
 * its Resend id, flip the subscriber status and settle THAT row's
 * status. A bounce is the outcome of a send, not a dispatch of its
 * own — appending a fresh row stamped with the webhook's clock made
 * the editor's journal show phantom runs that delivered 0 articles.
 * No-ops for unsupported event types or unknown ids (idempotent).
 * @param subs Subscriber repo.
 * @param log Send-log repo.
 * @param event Parsed event body.
 * @returns Nothing — side effects only.
 */
export const applyResendEvent = async (
  subs: SubscriberRepo,
  log: SendLogRepo,
  event: ResendEvent
): Promise<void> => {
  const mapped = STATUS_MAP[event.type]
  if (mapped === undefined) return
  const resendId = event.data?.email_id
  if (resendId === undefined || resendId === '') return
  const original = await log.findByResendId(resendId)
  if (original?.subscriberId === undefined) return
  await subs.setStatus(original.subscriberId, mapped.sub)
  await log.setStatus(original.id, mapped.log)
}
