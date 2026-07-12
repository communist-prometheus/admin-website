import { logEvent } from '../log/structured'
import {
  type ChunkCounts,
  recordFailedChunk,
  sendIndividually,
} from './chunk-fallback'
import { chunkIdempotencyKey } from './chunk-key'
import type { DispatchContext } from './context'
import type { SendPlan } from './plan'
import { recordSent } from './record'

export type { ChunkCounts } from './chunk-fallback'
export { chunkIdempotencyKey } from './chunk-key'

const recordSentChunk = (
  ctx: DispatchContext,
  group: ReadonlyArray<SendPlan>,
  ids: ReadonlyArray<string>
): Promise<unknown> =>
  Promise.all(
    group.map((p, j) => recordSent(ctx, p.sub, p.count, ids[j] ?? ''))
  )

/**
 * Send one chunk (≤100) through the Resend batch endpoint in a single
 * HTTP call. On a definitive rejection fall back to one email per
 * recipient; when the transient retries are exhausted the batch may or
 * may not have landed, so record the failure and let the next tick
 * replay it (the cutoff does not advance) rather than risk duplicates.
 * @param ctx Static tick-wide context.
 * @param group Subscribers + payloads for this chunk.
 * @param chunkIndex Zero-based index of the chunk within this tick.
 * @returns The chunk's sent / failed counts.
 */
export const sendChunk = async (
  ctx: DispatchContext,
  group: ReadonlyArray<SendPlan>,
  chunkIndex: number
): Promise<ChunkCounts> => {
  const res = await ctx.resend.sendBatch(
    group.map(p => p.input),
    chunkIdempotencyKey(ctx, chunkIndex)
  )
  if (res.ok) {
    await recordSentChunk(ctx, group, res.ids)
    return { sent: group.length, failed: 0 }
  }
  logEvent('batch.fail', { error: res.error, definitive: res.definitive })
  return res.definitive
    ? sendIndividually(ctx, group)
    : recordFailedChunk(ctx, group, res.error)
}
