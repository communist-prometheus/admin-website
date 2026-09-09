import type { D1Database } from '@cloudflare/workers-types'
import type { SendLogStatus } from './types'

const SQL = 'UPDATE send_log SET status = ? WHERE id = ?'

/**
 * Settle an existing row's status. Resend reports delivery outcomes
 * (bounce, complaint) minutes after the send, and they belong to the
 * row that produced them rather than to a dispatch of their own.
 * @param db D1 database binding.
 * @param id Row to settle.
 * @param status Outcome reported for it.
 * @returns Nothing — side effect only.
 */
export const setStatus = async (
  db: D1Database,
  id: number,
  status: SendLogStatus
): Promise<void> => {
  await db.prepare(SQL).bind(status, id).run()
}
