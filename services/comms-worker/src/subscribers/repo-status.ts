import type { D1Database } from '@cloudflare/workers-types'
import { findById } from './repo-read'
import type { Subscriber, SubscriberStatus } from './types'

const SQL_UPDATE_STATUS_INACTIVE =
  'UPDATE subscribers SET status = ?, unsubscribed_at = ? WHERE id = ?'
const SQL_UPDATE_STATUS_ACTIVE =
  "UPDATE subscribers SET status = 'active', unsubscribed_at = NULL WHERE id = ?"

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
