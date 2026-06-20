import type { D1Database } from '@cloudflare/workers-types'
import { findById } from './repo-read'
import { langsToJson } from './serialize'
import type { Lang, Subscriber } from './types'

const SQL_UPDATE_LANGS = 'UPDATE subscribers SET langs = ? WHERE id = ?'
const SQL_UPDATE_MESSAGE_LANG =
  'UPDATE subscribers SET message_lang = ? WHERE id = ?'
const SQL_MARK_SENT = 'UPDATE subscribers SET last_sent_at = ? WHERE id = ?'
const SQL_DELETE = 'DELETE FROM subscribers WHERE id = ?'

/** Update only the `langs[]` column on an existing row. */
export const updateLangs = async (
  db: D1Database,
  id: number,
  langs: ReadonlyArray<Lang>
): Promise<Subscriber | undefined> => {
  await db.prepare(SQL_UPDATE_LANGS).bind(langsToJson(langs), id).run()
  return findById(db, id)
}

/** Update only the `message_lang` column on an existing row. */
export const updateMessageLang = async (
  db: D1Database,
  id: number,
  messageLang: Lang
): Promise<Subscriber | undefined> => {
  await db.prepare(SQL_UPDATE_MESSAGE_LANG).bind(messageLang, id).run()
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
