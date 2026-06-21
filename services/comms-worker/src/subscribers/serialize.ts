import type { Lang, Subscriber, SubscriberStatus } from './types'
import { LANGS } from './types'

type Row = {
  readonly id: number
  readonly email: string
  readonly langs: string
  readonly message_lang: string
  readonly status: string
  readonly created_at: string
  readonly last_sent_at: string | null
  readonly unsubscribed_at: string | null
}

const isLang = (v: unknown): v is Lang =>
  typeof v === 'string' && (LANGS as ReadonlyArray<string>).includes(v)

const parseLangs = (json: string): ReadonlyArray<Lang> => {
  const parsed = JSON.parse(json) as unknown
  return Array.isArray(parsed) ? parsed.filter(isLang) : []
}

/**
 * Translate a raw D1 row into the domain `Subscriber` shape.
 * @param row Row returned by D1.
 * @returns Typed subscriber.
 */
export const rowToSubscriber = (row: Row): Subscriber => ({
  id: row.id,
  email: row.email,
  langs: parseLangs(row.langs),
  messageLang: isLang(row.message_lang) ? row.message_lang : 'en',
  status: row.status as SubscriberStatus,
  createdAt: row.created_at,
  lastSentAt: row.last_sent_at ?? undefined,
  unsubscribedAt: row.unsubscribed_at ?? undefined,
})

/** JSON-stringify a `langs[]` array for the D1 `langs` column. */
export const langsToJson = (langs: ReadonlyArray<Lang>): string =>
  JSON.stringify(langs)
