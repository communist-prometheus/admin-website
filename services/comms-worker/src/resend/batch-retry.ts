import { type BatchVerdict, sendBatchOnce } from './batch'
import { attemptsFor, backoffMs, CONFLICT } from './batch-budget'
import { buildBatchInit } from './batch-request'
import { exhaustedError, type QuotaKind } from './response'
import type { BatchResult, SendInput } from './types'

/**
 * A quota rejection ends the retry loop at once: the daily / monthly
 * cap will not clear in the seconds a backoff buys, so backing off just
 * burns the tick's wall-clock. Surface it so the dispatcher can pause
 * until the quota actually resets.
 * @param quota Which quota Resend reported exhausted.
 * @returns An all-failed batch result carrying the quota kind.
 */
const quotaResult = (quota: QuotaKind): BatchResult => ({
  ok: false,
  error: `resend ${quota}_quota_exceeded`,
  definitive: false,
  quota,
})

/** The result when a verdict settles the batch, or undefined to retry. */
const settle = (verdict: BatchVerdict): BatchResult | undefined => {
  if (verdict.kind === 'ok') return { ok: true, ids: verdict.ids }
  if (verdict.kind === 'fail')
    return { ok: false, error: verdict.error, definitive: true }
  return verdict.quota === undefined ? undefined : quotaResult(verdict.quota)
}

const waitOf = (verdict: BatchVerdict): number =>
  verdict.kind === 'retry' ? verdict.waitMs : 0

/** The result once the budget is spent: unknown for a conflict, failed otherwise. */
const exhausted = (lastStatus: number): BatchResult => ({
  ok: false,
  error: exhaustedError(lastStatus),
  definitive: false,
  unresolved: lastStatus === CONFLICT,
})

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
  let attempt = 0
  // The ceiling depends on what the server keeps answering, so it is
  // re-read each round rather than fixed before the first attempt.
  while (attempt < attemptsFor(lastStatus)) {
    attempt += 1
    const verdict = await sendBatchOnce(doFetch, init)
    const settled = settle(verdict)
    if (settled !== undefined) return settled
    lastStatus = verdict.kind === 'retry' ? verdict.status : lastStatus
    if (attempt < attemptsFor(lastStatus))
      await doSleep(backoffMs(attempt, waitOf(verdict), lastStatus))
  }
  return exhausted(lastStatus)
}
