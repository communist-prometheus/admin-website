import type { DispatchContext } from './context'

/**
 * Idempotency key for one chunk of one tick.
 *
 * It must be stable within a (tick, chunk) so a retry replays instead of
 * double-sending. That alone does not make it unique: another deployment
 * on the same Resend account derives the very same (tick, chunk), so the
 * Resend client binds this key to the request payload before sending —
 * see `resend/payload-key.ts`. The old key was built from the cutoff
 * watermark — which does not move on a failed tick, so a later tick
 * could reuse it with different content.
 * @param ctx Per-tick context.
 * @param chunkIndex Zero-based index of the chunk within the tick.
 * @returns The Resend `Idempotency-Key` for this chunk.
 */
export const chunkIdempotencyKey = (
  ctx: DispatchContext,
  chunkIndex: number
): string => `digest:${ctx.tickAt.toISOString()}:${chunkIndex}`
