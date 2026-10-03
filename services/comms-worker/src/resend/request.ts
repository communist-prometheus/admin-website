import { payloadBoundKey } from './payload-key'
import type { SendInput } from './types'

const buildBody = (input: SendInput): string =>
  JSON.stringify({
    from: input.from,
    to: [input.to],
    subject: input.subject,
    html: input.html,
    text: input.text,
    headers: input.headers,
  })

const baseHeaders = (apiKey: string): Record<string, string> => ({
  Authorization: `Bearer ${apiKey}`,
  'Content-Type': 'application/json',
  Accept: 'application/json',
})

/**
 * Build the `fetch` `RequestInit` used to POST a transactional email.
 * The idempotency key, when set, is bound to the payload — see
 * {@link payloadBoundKey}.
 * @param apiKey Resend API key.
 * @param input Email payload.
 * @returns Pre-built `RequestInit` ready to be passed to `fetch`.
 */
export const buildRequest = async (
  apiKey: string,
  input: SendInput
): Promise<RequestInit> => {
  const headers = baseHeaders(apiKey)
  const body = buildBody(input)
  if (input.idempotencyKey !== undefined) {
    headers['Idempotency-Key'] = await payloadBoundKey(
      input.idempotencyKey,
      body
    )
  }
  return { method: 'POST', headers, body }
}
