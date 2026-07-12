import type { DispatchContext } from './context'
import type { SendPlan } from './plan'
import { sendChunk } from './send-chunk'

/** Resend `/emails/batch` accepts at most 100 emails per call. */
const CHUNK_SIZE = 100

/** Per-tick send tally. */
export type SendCounts = {
  readonly sent: number
  readonly failed: number
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
  const groups = chunk(plans, CHUNK_SIZE)
  for (let i = 0; i < groups.length; i += 1) {
    const c = await sendChunk(ctx, groups[i] ?? [], i)
    sent += c.sent
    failed += c.failed
  }
  return { sent, failed }
}
