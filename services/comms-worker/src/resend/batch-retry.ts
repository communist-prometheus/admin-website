import { sendBatchOnce } from './batch'
import { buildBatchInit } from './batch-request'
import { exhaustedError } from './response'
import type { BatchResult, SendInput } from './types'

/**
 * Attempts per batch, and the base backoff between them.
 *
 * A 100-email batch takes Resend seconds to accept, so the old single
 * retry after a flat 1s landed while the original was still in flight
 * and collected a 409. Back off exponentially (2s, 4s, 8s) and give the
 * original time to settle: on a retry Resend replays whatever it
 * recorded against our idempotency key, so a batch that WAS accepted
 * comes back `ok` with its real ids instead of being written off.
 */
const MAX_ATTEMPTS = 4
const BASE_BACKOFF_MS = 2_000

const backoffMs = (attempt: number, hinted: number): number =>
  Math.max(hinted, BASE_BACKOFF_MS * 2 ** (attempt - 1))

/**
 * Send one Resend batch, retrying a transient failure (409 / 429 / 5xx
 * / network) with exponential backoff and preserving the real status
 * once the attempts are exhausted. The idempotency key makes every
 * retry a replay rather than a second send.
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
  let lastStatus = 0
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
    const verdict = await sendBatchOnce(doFetch, init)
    if (verdict.kind === 'ok') return { ok: true, ids: verdict.ids }
    if (verdict.kind === 'fail')
      return { ok: false, error: verdict.error, definitive: true }
    lastStatus = verdict.status
    if (attempt < MAX_ATTEMPTS)
      await doSleep(backoffMs(attempt, verdict.waitMs))
  }
  return {
    ok: false,
    error: exhaustedError(lastStatus),
    definitive: false,
  }
}
