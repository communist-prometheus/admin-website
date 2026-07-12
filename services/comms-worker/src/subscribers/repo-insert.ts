import type { D1Database } from '@cloudflare/workers-types'
import { langsToJson, rowToSubscriber } from './serialize'
import {
  type NewSubscriber,
  newDuplicateError,
  type Subscriber,
} from './types'

const SQL_INSERT =
  'INSERT INTO subscribers (email, langs, message_lang, created_at, last_sent_at) ' +
  'VALUES (?, ?, ?, ?, ?)'
const SQL_LAST = 'SELECT * FROM subscribers WHERE rowid = last_insert_rowid()'
const UNIQUE_MARKER = 'UNIQUE'

const runInsert = async (
  db: D1Database,
  email: string,
  stamp: string,
  input: NewSubscriber
): Promise<void> => {
  try {
    await db
      .prepare(SQL_INSERT)
      .bind(
        email,
        langsToJson(input.langs),
        input.messageLang ?? 'en',
        stamp,
        input.lastSentAt ?? stamp
      )
      .run()
  } catch (e) {
    if (e instanceof Error && e.message.includes(UNIQUE_MARKER)) {
      throw newDuplicateError(email)
    }
    throw e
  }
}

/**
 * Insert a new active subscriber row.
 *
 * `last_sent_at` doubles as the address's own "what is new" watermark, so
 * a new address is SEEDED with one — the shared cutoff when the caller
 * supplies it, otherwise the moment of signup. Without a seed the fresh
 * address would fall back to the shared cutoff and be mailed everything
 * the list has already seen since then.
 * @param db D1 database binding.
 * @param now Clock returning ISO-8601 timestamps.
 * @param input Email + langs + optional watermark seed.
 * @returns The persisted subscriber.
 * @throws DuplicateError when an active row with that email exists.
 */
export const insertSubscriber = async (
  db: D1Database,
  now: () => string,
  input: NewSubscriber
): Promise<Subscriber> => {
  const email = input.email.toLowerCase()
  await runInsert(db, email, now(), input)
  const row = await db.prepare(SQL_LAST).first()
  return rowToSubscriber(row as Parameters<typeof rowToSubscriber>[0])
}
