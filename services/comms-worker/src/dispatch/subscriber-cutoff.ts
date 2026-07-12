import type { Subscriber } from '../subscribers/types'

/**
 * The "what is new" boundary for ONE address.
 *
 * The watermark used to be global: every subscriber shared
 * `settings.cutoff_at`, so an address added mid-cycle inherited the
 * whole list's boundary and a failed send could only be replayed by
 * holding the boundary back for everybody. It is per-address now —
 * `subscribers.last_sent_at`, stamped on every successful send (manual
 * ones included), seeded from the shared cutoff when the address is
 * created, and editable by hand.
 *
 * The shared cutoff survives as the fallback for rows that were never
 * mailed and as the seed for new ones.
 * @param sub The recipient.
 * @param globalCutoffMs Shared `settings.cutoff_at`, in ms.
 * @returns Milliseconds since epoch, or undefined when no boundary exists.
 */
export const subscriberCutoffMs = (
  sub: Subscriber,
  globalCutoffMs: number | undefined
): number | undefined => {
  const own =
    sub.lastSentAt === undefined ? Number.NaN : Date.parse(sub.lastSentAt)
  return Number.isFinite(own) ? own : globalCutoffMs
}
