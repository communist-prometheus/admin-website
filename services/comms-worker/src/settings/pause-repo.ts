import type { D1Database } from '@cloudflare/workers-types'

type Row = { readonly value: string }

const KEY = 'paused_until'
const SQL_GET = 'SELECT value FROM settings WHERE key = ?'
const SQL_UPSERT =
  'INSERT INTO settings (key, value) VALUES (?, ?) ' +
  'ON CONFLICT(key) DO UPDATE SET value = excluded.value'
const SQL_DELETE = 'DELETE FROM settings WHERE key = ?'

/**
 * Read the "dispatch paused until" watermark, or undefined when the
 * dispatch is not paused. Set when Resend rejects a send with a quota
 * error (daily / monthly) so the cron stops re-attempting until the
 * quota resets.
 * @param db D1 database binding.
 * @returns ISO string of the resume instant, or undefined.
 */
export const fetchPausedUntil = async (
  db: D1Database
): Promise<string | undefined> => {
  const row = (await db.prepare(SQL_GET).bind(KEY).first()) as Row | null
  return row === null
    ? undefined
    : (JSON.parse(row.value) as { at: string }).at
}

/**
 * Persist the resume instant — the dispatch is held until this moment.
 * @param db D1 database binding.
 * @param iso ISO string of the resume instant.
 */
export const persistPausedUntil = async (
  db: D1Database,
  iso: string
): Promise<void> => {
  await db
    .prepare(SQL_UPSERT)
    .bind(KEY, JSON.stringify({ at: iso }))
    .run()
}

/**
 * Drop the pause so the next matching tick dispatches normally.
 * @param db D1 database binding.
 */
export const dropPausedUntil = async (db: D1Database): Promise<void> => {
  await db.prepare(SQL_DELETE).bind(KEY).run()
}
