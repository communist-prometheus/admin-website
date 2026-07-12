import type { D1Database } from '@cloudflare/workers-types'
import { rowToSendLog, type SendLogRow } from './serialize'
import type { SendLogWithEmail } from './with-email'

type JoinedRow = SendLogRow & { readonly email: string | null }

const SQL =
  'SELECT l.*, s.email AS email ' +
  'FROM send_log l LEFT JOIN subscribers s ON s.id = l.subscriber_id ' +
  'WHERE l.tick_at = ? ORDER BY l.status, s.email'

/**
 * Every row written by one tick, with the recipient's address. The
 * post-run report is built from this rather than from in-memory
 * counters, so it reports what was actually persisted — including the
 * rows written by the per-recipient fallback.
 * @param db D1 database binding.
 * @param tickAt ISO timestamp identifying the tick.
 * @returns Rows for that tick, failures grouped together.
 */
export const listByTickWithEmail = async (
  db: D1Database,
  tickAt: string
): Promise<ReadonlyArray<SendLogWithEmail>> => {
  const r = await db.prepare(SQL).bind(tickAt).all<JoinedRow>()
  return (r.results ?? []).map(row => ({
    ...rowToSendLog(row),
    email: row.email ?? undefined,
  }))
}
