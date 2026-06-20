import { sendBatchOnce } from './batch'
import { buildBatchInit } from './batch-request'
import { exhaustedError } from './response'
import type { BatchResult, SendInput } from './types'

/**
 * Send one Resend batch with a single retry on a retryable failure
 * (429 / 5xx / network), preserving the real status if it is exhausted.
 * @param doFetch Injected fetch.
 * @param doSleep Injected backoff sleeper.
 * @param apiKey Resend API key.
 * @param inputs Emails to send (≤100).
 * @param idempotencyKey Optional request-level idempotency key.
 * @returns All-or-nothing batch result.
 */
export const sendBatchWithRetry = async (
  doFetch: typeof fetch,
  doSleep: (ms: number) => Promise<void>,
  apiKey: string,
  inputs: ReadonlyArray<SendInput>,
  idempotencyKey?: string
): Promise<BatchResult> => {
  const init = buildBatchInit(apiKey, inputs, idempotencyKey)
  const first = await sendBatchOnce(doFetch, init)
  if (first.kind === 'ok') return { ok: true, ids: first.ids }
  if (first.kind === 'fail') return { ok: false, error: first.error }
  await doSleep(first.waitMs)
  const second = await sendBatchOnce(doFetch, init)
  if (second.kind === 'ok') return { ok: true, ids: second.ids }
  return {
    ok: false,
    error:
      second.kind === 'fail' ? second.error : exhaustedError(second.status),
  }
}
