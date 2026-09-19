import type { ChunkCounts } from './chunk-fallback'
import { chunkIdempotencyKey } from './chunk-key'
import { rejected } from './chunk-rejected'
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
 * Send one chunk through the Resend batch endpoint in a single HTTP
 * call. Anything the endpoint does not accept is handed to `rejected`,
 * which decides between retrying one email at a time, recording a
 * failure, and recording an outcome Resend never settled on.
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
    return { sent: group.length, failed: 0, unresolved: 0 }
  }
  return rejected(ctx, group, res)
}
