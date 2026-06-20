import { sendOnce } from './attempt'
import { buildRequest } from './request'
import { exhaustedError } from './response'
import type { SendInput, SendResult } from './types'

/**
 * Send one transactional email with a single retry on a retryable
 * failure (429 / 5xx / network), preserving the real status on
 * exhaustion.
 * @param doFetch Injected fetch.
 * @param doSleep Injected backoff sleeper.
 * @param apiKey Resend API key.
 * @param input Email payload.
 * @returns Send result.
 */
export const sendWithRetry = async (
  doFetch: typeof fetch,
  doSleep: (ms: number) => Promise<void>,
  apiKey: string,
  input: SendInput
): Promise<SendResult> => {
  const init = buildRequest(apiKey, input)
  const first = await sendOnce(doFetch, init)
  if ('ok' in first) return first
  await doSleep(first.retryAfterMs)
  const second = await sendOnce(doFetch, init)
  return 'ok' in second
    ? second
    : { ok: false, error: exhaustedError(second.status) }
}
