import type { D1Database } from '@cloudflare/workers-types'
import { langsToJson, rowToSubscriber } from './serialize'
import {
  type NewSubscriber,
  newDuplicateError,
  type Subscriber,
} from './types'

const SQL_INSERT =
  'INSERT INTO subscribers (email, langs, message_lang, created_at) VALUES (?, ?, ?, ?)'
const SQL_LAST = 'SELECT * FROM subscribers WHERE rowid = last_insert_rowid()'
const UNIQUE_MARKER = 'UNIQUE'

/**
 * Insert a new active subscriber row.
 * @param db D1 database binding.
 * @param now Clock returning ISO-8601 timestamps.
 * @param input Email + langs to persist.
 * @returns The persisted subscriber.
 * @throws DuplicateError when an active row with that email exists.
 */
export const insertSubscriber = async (
  db: D1Database,
  now: () => string,
  input: NewSubscriber
): Promise<Subscriber> => {
  const email = input.email.toLowerCase()
  try {
    await db
      .prepare(SQL_INSERT)
      .bind(email, langsToJson(input.langs), input.messageLang ?? 'en', now())
      .run()
  } catch (e) {
    if (e instanceof Error && e.message.includes(UNIQUE_MARKER)) {
      throw newDuplicateError(email)
    }
    throw e
  }
  const row = await db.prepare(SQL_LAST).first()
  return rowToSubscriber(row as Parameters<typeof rowToSubscriber>[0])
}
