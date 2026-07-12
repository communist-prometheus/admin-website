import type { D1Database } from '@cloudflare/workers-types'

/** An active address whose most recent send attempt failed. */
export type FailedRecipient = {
  readonly id: number
  readonly email: string
  readonly tickAt: string
  readonly error: string | undefined
}

type Row = {
  readonly id: number
  readonly email: string
  readonly tick_at: string
  readonly error: string | null
}

/*
 * Whose LATEST send_log row is a failure — not "who failed in the last
 * tick". That distinction is what makes the retry safe to press twice:
 * a successful send writes a newer row, so the address drops out of this
 * set and can never be mailed the same digest again.
 */
const SQL =
  'SELECT s.id, s.email, l.tick_at, l.error FROM subscribers s ' +
  'JOIN send_log l ON l.id = (' +
  'SELECT l2.id FROM send_log l2 WHERE l2.subscriber_id = s.id ' +
  'ORDER BY l2.tick_at DESC, l2.id DESC LIMIT 1) ' +
  "WHERE s.status = 'active' AND l.status = 'failed' " +
  'ORDER BY s.email'

/**
 * The recipients a "resend to failed" run would target.
 * @param db D1 database binding.
 * @returns Active addresses whose last attempt failed, with the error.
 */
export const listFailedRecipients = async (
  db: D1Database
): Promise<ReadonlyArray<FailedRecipient>> => {
  const r = await db.prepare(SQL).all<Row>()
  return (r.results ?? []).map(row => ({
    id: row.id,
    email: row.email,
    tickAt: row.tick_at,
    error: row.error ?? undefined,
  }))
}
