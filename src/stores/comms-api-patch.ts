import { decodeResponse } from '@/validation/decode-response'
import type { Lang, Subscriber } from '@/validation/schemas/subscriber'
import { SubscriberSchema } from '@/validation/schemas/subscriber'
import { commsFetch, jsonHeaders } from './comms-http'

const patchSubscriber = async (
  id: number,
  body: Readonly<Record<string, unknown>>
): Promise<Subscriber> => {
  const res = await commsFetch(`/api/subscribers/${id}`, {
    method: 'PATCH',
    headers: jsonHeaders(),
    body: JSON.stringify(body),
  })
  return decodeResponse(SubscriberSchema)(res)
}

/**
 * PATCH /api/subscribers/:id — replace the langs[] array.
 * @param id Subscriber id.
 * @param langs Replacement language list.
 * @returns The updated subscriber row.
 */
export const apiUpdateLangs = (
  id: number,
  langs: ReadonlyArray<Lang>
): Promise<Subscriber> => patchSubscriber(id, { langs })

/**
 * PATCH /api/subscribers/:id — change the email-shell message language.
 * @param id Subscriber id.
 * @param messageLang Replacement message language.
 * @returns The updated subscriber row.
 */
export const apiUpdateMessageLang = (
  id: number,
  messageLang: Lang
): Promise<Subscriber> => patchSubscriber(id, { messageLang })
