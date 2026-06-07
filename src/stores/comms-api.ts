import { decodeResponse } from '@/validation/decode-response'
import type {
  Lang,
  Subscriber,
  SubscribersList,
} from '@/validation/schemas/subscriber'
import {
  SubscriberSchema,
  SubscribersListSchema,
} from '@/validation/schemas/subscriber'
import { commsFetch, ensureOk, jsonHeaders } from './comms-http'

/**
 * GET /api/subscribers — list every subscriber row, regardless of status.
 * @returns Parsed list payload.
 */
export const apiListSubscribers = async (): Promise<SubscribersList> => {
  const res = await commsFetch('/api/subscribers')
  return decodeResponse(SubscribersListSchema)(res)
}

/**
 * POST /api/subscribers — create one new active subscriber.
 * @param email Lower-case canonical email address.
 * @param langs Languages the subscriber wants in their digest.
 * @returns The persisted subscriber row.
 */
export const apiAddSubscriber = async (
  email: string,
  langs: ReadonlyArray<Lang>
): Promise<Subscriber> => {
  const res = await commsFetch('/api/subscribers', {
    method: 'POST',
    headers: jsonHeaders(),
    body: JSON.stringify({ email, langs }),
  })
  return decodeResponse(SubscriberSchema)(res)
}

/**
 * PATCH /api/subscribers/:id — replace the langs[] array.
 * @param id Subscriber id.
 * @param langs Replacement language list.
 * @returns The updated subscriber row.
 */
export const apiUpdateLangs = async (
  id: number,
  langs: ReadonlyArray<Lang>
): Promise<Subscriber> => {
  const res = await commsFetch(`/api/subscribers/${id}`, {
    method: 'PATCH',
    headers: jsonHeaders(),
    body: JSON.stringify({ langs }),
  })
  return decodeResponse(SubscriberSchema)(res)
}

/**
 * DELETE /api/subscribers/:id — hard delete.
 * @param id Subscriber id.
 * @returns Nothing; throws on non-2xx.
 */
export const apiRemoveSubscriber = async (id: number): Promise<void> => {
  ensureOk(
    await commsFetch(`/api/subscribers/${id}`, { method: 'DELETE' }),
    'Delete'
  )
}
