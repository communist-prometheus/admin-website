import type { QuotaKind } from '../resend/response'
import type { DispatchContext } from './context'
import type { SendPlan } from './plan'
import { sendChunk } from './send-chunk'

/**
 * Emails per Resend batch call.
 *
 * The endpoint accepts 100, and 100 was what we sent — but Resend needs
 * proportionally longer to accept a full batch, and twice a 100-email
 * chunk outlived the retry budget and answered 409 to exhaustion
 * (2026-07-11, 2026-09-12). Half the size settles in well under it; the
 * cost is one extra HTTP call per 50 recipients, which is nothing next
 * to writing a hundred deliveries off as failures.
 */
const CHUNK_SIZE = 50

/** Per-tick send tally. */
export type SendCounts = {
  readonly sent: number
  readonly failed: number
  /** Recipients whose batch Resend never settled on (409 to exhaustion). */
  readonly unresolved: number
  /**
   * Set once any chunk hit an account-wide quota. Sending stopped at
   * that chunk — the recipients after it were never attempted, so they
   * carry no failed rows and replay on the tick after the quota resets.
   */
  readonly quota?: QuotaKind
}

const chunk = (
  plans: ReadonlyArray<SendPlan>,
  size: number
): ReadonlyArray<ReadonlyArray<SendPlan>> => {
  const out: SendPlan[][] = []
  for (let i = 0; i < plans.length; i += size)
    out.push(plans.slice(i, i + size))
  return out
}

/**
 * Send every planned digest in batches of ≤100 through the Resend batch
 * endpoint — one HTTP request per chunk, so a 98-recipient broadcast is
 * one call, not 98 (no per-second rate-limit burst).
 * @param ctx Static tick-wide context (holds the Resend client).
 * @param plans Subscribers with content this tick + their payloads.
 * @returns Aggregate sent / failed counts across all chunks.
 */
export const sendInBatches = async (
  ctx: DispatchContext,
  plans: ReadonlyArray<SendPlan>
): Promise<SendCounts> => {
  let sent = 0
  let failed = 0
  let unresolved = 0
  const groups = chunk(plans, CHUNK_SIZE)
  for (let i = 0; i < groups.length; i += 1) {
    const c = await sendChunk(ctx, groups[i] ?? [], i)
    sent += c.sent
    failed += c.failed
    unresolved += c.unresolved
    if (c.quota !== undefined)
      return { sent, failed, unresolved, quota: c.quota }
  }
  return { sent, failed, unresolved }
}
