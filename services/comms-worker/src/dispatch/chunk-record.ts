import type { ChunkCounts } from './chunk-fallback'
import type { DispatchContext } from './context'
import type { SendPlan } from './plan'
import { recordFailed } from './record'
import { recordUnresolved } from './record-unresolved'

/**
 * Write the whole chunk off as failed under one shared error.
 * @param ctx Per-tick context.
 * @param group The chunk.
 * @param error Error to record against every recipient.
 * @returns Tally (always all-failed).
 */
export const recordFailedChunk = async (
  ctx: DispatchContext,
  group: ReadonlyArray<SendPlan>,
  error: string
): Promise<ChunkCounts> => {
  await Promise.all(group.map(p => recordFailed(ctx, p.sub, p.count, error)))
  return { sent: 0, failed: group.length, unresolved: 0 }
}

/**
 * Record a chunk whose outcome Resend never settled on.
 * @param ctx Per-tick context.
 * @param group The chunk.
 * @param error The last status, recorded against every recipient.
 * @returns Tally (all unresolved).
 */
export const recordUnresolvedChunk = async (
  ctx: DispatchContext,
  group: ReadonlyArray<SendPlan>,
  error: string
): Promise<ChunkCounts> => {
  await Promise.all(
    group.map(p => recordUnresolved(ctx, p.sub, p.count, error))
  )
  return { sent: 0, failed: 0, unresolved: group.length }
}
