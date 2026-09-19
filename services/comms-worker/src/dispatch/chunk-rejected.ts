import { logEvent } from '../log/structured'
import type { BatchResult } from '../resend/types'
import { type ChunkCounts, sendIndividually } from './chunk-fallback'
import { recordFailedChunk, recordUnresolvedChunk } from './chunk-record'
import type { DispatchContext } from './context'
import type { SendPlan } from './plan'

/** The rejection arm of a {@link BatchResult}. */
type BatchRejection = Extract<BatchResult, { ok: false }>

/**
 * Record a chunk the batch endpoint did not accept. A definitive
 * rejection is retried one email at a time; a batch Resend was still
 * processing is recorded as unresolved rather than failed, so the run is
 * not reported red for mail that may well have gone out.
 * @param ctx Per-tick context.
 * @param group The chunk.
 * @param res The batch rejection.
 * @returns The chunk's tally.
 */
export const rejected = async (
  ctx: DispatchContext,
  group: ReadonlyArray<SendPlan>,
  res: BatchRejection
): Promise<ChunkCounts> => {
  logEvent('batch.fail', {
    error: res.error,
    definitive: res.definitive,
    quota: res.quota,
    unresolved: res.unresolved,
  })
  if (res.definitive) return sendIndividually(ctx, group)
  const counts =
    res.unresolved === true
      ? await recordUnresolvedChunk(ctx, group, res.error)
      : await recordFailedChunk(ctx, group, res.error)
  return res.quota === undefined ? counts : { ...counts, quota: res.quota }
}
