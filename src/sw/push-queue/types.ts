/**
 * Single entry in the SW push queue. Identified by `sha` so the
 * queue can be re-enqueued idempotently (same commit = same id).
 */
export type PushQueueEntry = {
  readonly sha: string
  readonly branch: string
  readonly message: string
  readonly enqueuedAt: number
  readonly attempt?: number
}
