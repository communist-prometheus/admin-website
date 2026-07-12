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

/**
 * PATCH /api/subscribers/:id — move this address's own "what is new"
 * watermark. The dispatch measures new articles against it, so winding it
 * back replays a digest for this address alone; `null` clears it and drops
 * the address back to the shared cutoff.
 * @param id Subscriber id.
 * @param lastSentAt New watermark (ISO-8601), or null to clear.
 * @returns The updated subscriber row.
 */
export const apiUpdateLastSent = (
  id: number,
  lastSentAt: string | null
): Promise<Subscriber> => patchSubscriber(id, { lastSentAt })
