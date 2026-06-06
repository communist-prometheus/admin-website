import type { D1Database } from '@cloudflare/workers-types'
import { rowToSendLog, type SendLogRow } from './serialize'
import type { NewSendLog, SendLog } from './types'

const SQL_INSERT =
  'INSERT INTO send_log (subscriber_id, tick_at, article_count, status, resend_id, error) ' +
  'VALUES (?, ?, ?, ?, ?, ?)'
const SQL_LIST =
  'SELECT * FROM send_log ORDER BY tick_at DESC, id DESC LIMIT ?'
const SQL_PURGE = 'DELETE FROM send_log WHERE tick_at < ?'
const SQL_BY_RESEND_ID = 'SELECT * FROM send_log WHERE resend_id = ? LIMIT 1'

/** Insert one log row. */
export const append = async (
  db: D1Database,
  row: NewSendLog
): Promise<void> => {
  await db
    .prepare(SQL_INSERT)
    .bind(
      row.subscriberId ?? null,
      row.tickAt,
      row.articleCount,
      row.status,
      row.resendId ?? null,
      row.error ?? null
    )
    .run()
}

/** Return the most-recent N rows newest tick first. */
export const listRecent = async (
  db: D1Database,
  limit: number
): Promise<ReadonlyArray<SendLog>> => {
  const r = await db.prepare(SQL_LIST).bind(limit).all<SendLogRow>()
  return (r.results ?? []).map(rowToSendLog)
}

/** Delete rows older than the cutoff; returns rows-affected. */
export const purgeOlderThan = async (
  db: D1Database,
  cutoffIsoUtc: string
): Promise<number> => {
  const r = await db.prepare(SQL_PURGE).bind(cutoffIsoUtc).run()
  return r.meta.changes
}

/** Look up the (most-recent) row carrying a given Resend message id. */
export const findByResendId = async (
  db: D1Database,
  resendId: string
): Promise<SendLog | undefined> => {
  const row = (await db
    .prepare(SQL_BY_RESEND_ID)
    .bind(resendId)
    .first()) as SendLogRow | null
  return row === null ? undefined : rowToSendLog(row)
}
