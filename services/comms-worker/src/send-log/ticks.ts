import type { D1Database } from '@cloudflare/workers-types'
import { rowToTick, type TickRow, type TickSummary } from './ticks-row'

export type { TickSummary } from './ticks-row'

const countOf = (status: string): string =>
  `SUM(CASE WHEN status = '${status}' THEN 1 ELSE 0 END) AS ${status}`

const COUNTS = ['sent', 'failed', 'bounced', 'complained', 'skipped']
  .map(countOf)
  .join(', ')

const SQL =
  `SELECT tick_at, COUNT(*) AS recipients, ${COUNTS}, ` +
  'MAX(article_count) AS article_count ' +
  'FROM send_log GROUP BY tick_at ORDER BY tick_at DESC LIMIT ? OFFSET ?'

/**
 * The dispatch history the editor actually asked for: one entry per
 * tick rather than one per recipient. A run to 120 addresses is a
 * single entry carrying its outcome breakdown.
 * @param db D1 database binding.
 * @param limit Maximum runs to return.
 * @param offset Runs to skip, for paging back through history.
 * @returns Run summaries, newest first.
 */
export const listTickSummaries = async (
  db: D1Database,
  limit: number,
  offset = 0
): Promise<ReadonlyArray<TickSummary>> => {
  const r = await db.prepare(SQL).bind(limit, offset).all<TickRow>()
  return (r.results ?? []).map(rowToTick)
}
