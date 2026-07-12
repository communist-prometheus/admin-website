import type { D1Database } from '@cloudflare/workers-types'
import { rowToSendLog, type SendLogRow } from './serialize'
import type { SendLog } from './types'

/** A send_log row joined with the subscriber email (if still present). */
export type SendLogWithEmail = SendLog & {
  readonly email: string | undefined
}

type JoinedRow = SendLogRow & { readonly email: string | null }

const SQL =
  'SELECT l.*, s.email AS email ' +
  'FROM send_log l LEFT JOIN subscribers s ON s.id = l.subscriber_id ' +
  'ORDER BY l.tick_at DESC, l.id DESC LIMIT ? OFFSET ?'

const lift = (row: JoinedRow): SendLogWithEmail => ({
  ...rowToSendLog(row),
  email: row.email ?? undefined,
})

/**
 * Return one page of send-log rows enriched with the subscriber's
 * email, when still present. Used by `GET /api/runs` to show the editor
 * a readable run history without a second round-trip.
 * @param db D1 database binding.
 * @param limit Maximum rows to return (caller validates the bound).
 * @param offset Rows to skip, for paging back through history.
 * @returns Joined rows, newest tick first.
 */
export const listRecentWithEmail = async (
  db: D1Database,
  limit: number,
  offset = 0
): Promise<ReadonlyArray<SendLogWithEmail>> => {
  const r = await db.prepare(SQL).bind(limit, offset).all<JoinedRow>()
  return (r.results ?? []).map(lift)
}
