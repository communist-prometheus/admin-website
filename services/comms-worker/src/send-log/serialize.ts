import type { SendLog, SendLogStatus } from './types'

/** Raw row shape returned by the D1 driver for the `send_log` table. */
export type SendLogRow = {
  readonly id: number
  readonly subscriber_id: number | null
  readonly tick_at: string
  readonly article_count: number
  readonly status: SendLogStatus
  readonly resend_id: string | null
  readonly error: string | null
}

const opt = <T>(v: T | null): T | undefined => v ?? undefined

/**
 * Lift a D1 row into the domain {@link SendLog} type — null → undefined.
 * @param row Raw row from D1.
 * @returns Domain object.
 */
export const rowToSendLog = (row: SendLogRow): SendLog => ({
  id: row.id,
  subscriberId: opt(row.subscriber_id),
  tickAt: row.tick_at,
  articleCount: row.article_count,
  status: row.status,
  resendId: opt(row.resend_id),
  error: opt(row.error),
})
