import { logEvent } from '../log/structured'
import type { DispatchContext } from './context'
import type { SendPlan } from './plan'
import { recordFailed, recordSent } from './record'

/** Per-chunk send tally. */
export type ChunkCounts = {
  readonly sent: number
  readonly failed: number
}

const recordSentChunk = (
  ctx: DispatchContext,
  group: ReadonlyArray<SendPlan>,
  ids: ReadonlyArray<string>
): Promise<unknown> =>
  Promise.all(
    group.map((p, j) => recordSent(ctx, p.sub, p.count, ids[j] ?? ''))
  )

const recordFailedChunk = (
  ctx: DispatchContext,
  group: ReadonlyArray<SendPlan>,
  error: string
): Promise<unknown> =>
  Promise.all(group.map(p => recordFailed(ctx, p.sub, p.count, error)))

/**
 * Send one chunk (≤100) through the Resend batch endpoint in a single
 * HTTP call. All-or-nothing: record every recipient `sent` or every
 * recipient `failed` (with the real Resend status).
 * @param ctx Static tick-wide context.
 * @param group Subscribers + payloads for this chunk.
 * @returns The chunk's sent / failed counts.
 */
export const sendChunk = async (
  ctx: DispatchContext,
  group: ReadonlyArray<SendPlan>
): Promise<ChunkCounts> => {
  const idem = `digest:${ctx.cutoffMs ?? 'none'}:${group[0]?.sub.id ?? 0}`
  const res = await ctx.resend.sendBatch(
    group.map(p => p.input),
    idem
  )
  if (res.ok) {
    await recordSentChunk(ctx, group, res.ids)
    return { sent: group.length, failed: 0 }
  }
  logEvent('batch.fail', { error: res.error, size: group.length })
  await recordFailedChunk(ctx, group, res.error)
  return { sent: 0, failed: group.length }
}
