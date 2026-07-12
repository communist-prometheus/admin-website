import type { D1Database } from '@cloudflare/workers-types'
import { rowToSendLog, type SendLogRow } from './serialize'
import type { SendLog } from './types'

const SQL =
  'SELECT * FROM send_log WHERE subscriber_id = ? ' +
  'ORDER BY tick_at DESC, id DESC'

/**
 * The full send history of one address — every tick it was mailed on,
 * what it got, and why it failed when it did. Unbounded on purpose: the
 * retention sweep already caps how far back the table goes (90 days).
 * @param db D1 database binding.
 * @param subscriberId Subscriber to look up.
 * @returns That subscriber's rows, newest first.
 */
export const listForSubscriber = async (
  db: D1Database,
  subscriberId: number
): Promise<ReadonlyArray<SendLog>> => {
  const r = await db.prepare(SQL).bind(subscriberId).all<SendLogRow>()
  return (r.results ?? []).map(rowToSendLog)
}
