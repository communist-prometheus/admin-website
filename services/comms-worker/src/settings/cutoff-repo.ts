import type { D1Database } from '@cloudflare/workers-types'

type Row = { readonly value: string }

const KEY = 'cutoff_at'
const SQL_GET = 'SELECT value FROM settings WHERE key = ?'
const SQL_UPSERT =
  'INSERT INTO settings (key, value) VALUES (?, ?) ' +
  'ON CONFLICT(key) DO UPDATE SET value = excluded.value'
const SQL_DELETE = 'DELETE FROM settings WHERE key = ?'

/**
 * Read the global cutoff watermark, or undefined when no cutoff has
 * been recorded yet (fresh install or after a manual reset).
 * @param db D1 database binding.
 * @returns ISO string, or undefined.
 */
export const fetchCutoffAt = async (
  db: D1Database
): Promise<string | undefined> => {
  const row = (await db.prepare(SQL_GET).bind(KEY).first()) as Row | null
  return row === null
    ? undefined
    : (JSON.parse(row.value) as { at: string }).at
}

/**
 * Persist a new cutoff watermark.
 * @param db D1 database binding.
 * @param iso ISO string to save.
 */
export const persistCutoffAt = async (
  db: D1Database,
  iso: string
): Promise<void> => {
  await db
    .prepare(SQL_UPSERT)
    .bind(KEY, JSON.stringify({ at: iso }))
    .run()
}

/**
 * Drop the cutoff row so the next dispatch includes every article.
 * @param db D1 database binding.
 */
export const dropCutoffAt = async (db: D1Database): Promise<void> => {
  await db.prepare(SQL_DELETE).bind(KEY).run()
}
