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
 * @param apiKey Resend API key.
 * @param input Email payload.
 * @returns Pre-built `RequestInit` ready to be passed to `fetch`.
 */
export const buildRequest = (
  apiKey: string,
  input: SendInput
): RequestInit => {
  const headers = baseHeaders(apiKey)
  if (input.idempotencyKey !== undefined) {
    headers['Idempotency-Key'] = input.idempotencyKey
  }
  return { method: 'POST', headers, body: buildBody(input) }
}
