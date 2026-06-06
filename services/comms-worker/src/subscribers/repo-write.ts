import type { D1Database } from '@cloudflare/workers-types'
import { findById } from './repo-read'
import { langsToJson } from './serialize'
import type { Lang, Subscriber, SubscriberStatus } from './types'

const SQL_UPDATE_LANGS = 'UPDATE subscribers SET langs = ? WHERE id = ?'
const SQL_MARK_SENT = 'UPDATE subscribers SET last_sent_at = ? WHERE id = ?'
const SQL_DELETE = 'DELETE FROM subscribers WHERE id = ?'
const SQL_UPDATE_STATUS_INACTIVE =
  'UPDATE subscribers SET status = ?, unsubscribed_at = ? WHERE id = ?'
const SQL_UPDATE_STATUS_ACTIVE =
  "UPDATE subscribers SET status = 'active', unsubscribed_at = NULL WHERE id = ?"

/** Update only the `langs[]` column on an existing row. */
export const updateLangs = async (
  db: D1Database,
  id: number,
  langs: ReadonlyArray<Lang>
): Promise<Subscriber | undefined> => {
  await db.prepare(SQL_UPDATE_LANGS).bind(langsToJson(langs), id).run()
  return findById(db, id)
}

/** Stamp `last_sent_at` after a successful dispatch send. */
export const markSent = async (
  db: D1Database,
  id: number,
  sentAtIso: string
): Promise<void> => {
  await db.prepare(SQL_MARK_SENT).bind(sentAtIso, id).run()
}

/** Hard-delete one row by id, returning `true` iff something was deleted. */
export const removeSubscriber = async (
  db: D1Database,
  id: number
): Promise<boolean> => {
  const res = await db.prepare(SQL_DELETE).bind(id).run()
  return (res.meta.changes ?? 0) > 0
}

/** Transition a row's status; stamps `unsubscribed_at` on leave-active. */
export const setStatus = async (
  db: D1Database,
  now: () => string,
  id: number,
  status: SubscriberStatus
): Promise<Subscriber | undefined> => {
  const sql =
    status === 'active'
      ? SQL_UPDATE_STATUS_ACTIVE
      : SQL_UPDATE_STATUS_INACTIVE
  const stmt =
    status === 'active'
      ? db.prepare(sql).bind(id)
      : db.prepare(sql).bind(status, now(), id)
  await stmt.run()
  return findById(db, id)
}
