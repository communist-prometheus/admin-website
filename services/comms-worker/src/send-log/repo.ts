import type { D1Database } from '@cloudflare/workers-types'
import { rowToSendLog, type SendLogRow } from './serialize'
import type { NewSendLog, SendLog } from './types'

/** Repo facade for the `send_log` table. */
export type SendLogRepo = {
  readonly append: (row: NewSendLog) => Promise<void>
  readonly listRecent: (limit: number) => Promise<ReadonlyArray<SendLog>>
  readonly purgeOlderThan: (cutoffIsoUtc: string) => Promise<number>
}

type Deps = { readonly db: D1Database }

const SQL_INSERT =
  'INSERT INTO send_log (subscriber_id, tick_at, article_count, status, resend_id, error) ' +
  'VALUES (?, ?, ?, ?, ?, ?)'
const SQL_LIST =
  'SELECT * FROM send_log ORDER BY tick_at DESC, id DESC LIMIT ?'
const SQL_PURGE = 'DELETE FROM send_log WHERE tick_at < ?'

const append = async (db: D1Database, row: NewSendLog): Promise<void> => {
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

const listRecent = async (
  db: D1Database,
  limit: number
): Promise<ReadonlyArray<SendLog>> => {
  const r = await db.prepare(SQL_LIST).bind(limit).all<SendLogRow>()
  return (r.results ?? []).map(rowToSendLog)
}

const purgeOlderThan = async (
  db: D1Database,
  cutoffIsoUtc: string
): Promise<number> => {
  const r = await db.prepare(SQL_PURGE).bind(cutoffIsoUtc).run()
  return r.meta.changes
}

/**
 * Build a `send_log` repo bound to the given D1 database.
 * @param d Injected dependencies.
 * @returns Repo facade.
 */
export const createSendLogRepo = (d: Deps): SendLogRepo => ({
  append: row => append(d.db, row),
  listRecent: limit => listRecent(d.db, limit),
  purgeOlderThan: cutoff => purgeOlderThan(d.db, cutoff),
})
