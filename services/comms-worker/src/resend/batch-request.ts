import { payloadBoundKey } from './payload-key'
import type { SendInput } from './types'

/** Resend batch transactional email endpoint (≤100 emails per call). */
export const RESEND_BATCH_URL = 'https://api.resend.com/emails/batch'

const toEmail = (i: SendInput): Record<string, unknown> => ({
  from: i.from,
  to: [i.to],
  subject: i.subject,
  html: i.html,
  text: i.text,
  ...(i.headers ? { headers: i.headers } : {}),
})

/**
 * Build the `fetch` init for a Resend batch POST. The optional
 * idempotency key applies to the whole request and is bound to its
 * payload — see {@link payloadBoundKey}.
 * @param apiKey Resend API key.
 * @param inputs Emails to send (≤100).
 * @param idempotencyKey Optional request-level idempotency key.
 * @returns Pre-built `RequestInit`.
 */
export const buildBatchInit = async (
  apiKey: string,
  inputs: ReadonlyArray<SendInput>,
  idempotencyKey?: string
): Promise<RequestInit> => {
  const body = JSON.stringify(inputs.map(toEmail))
  return {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(idempotencyKey
        ? { 'Idempotency-Key': await payloadBoundKey(idempotencyKey, body) }
        : {}),
    },
    body,
  }
}
