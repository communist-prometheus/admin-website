import { classify, DEFAULT_BACKOFF_MS } from './response'
import type { SendResult } from './types'

/** Resend transactional email endpoint. */
export const RESEND_API_URL = 'https://api.resend.com/emails'

const attempt = async (
  doFetch: typeof fetch,
  init: RequestInit
): Promise<Response | undefined> => {
  try {
    return await doFetch(RESEND_API_URL, init)
  } catch {
    return undefined
  }
}

/** Retryable backoff hint carrying the last status (0 = network error). */
export type RetryHint = {
  readonly retryAfterMs: number
  readonly status: number
}

const handleAttempt = async (
  res: Response | undefined
): Promise<SendResult | RetryHint> => {
  if (res === undefined)
    return { retryAfterMs: DEFAULT_BACKOFF_MS, status: 0 }
  const verdict = await classify(res)
  return verdict.kind === 'retry'
    ? { retryAfterMs: verdict.waitMs, status: verdict.status }
    : verdict.kind === 'ok'
      ? { ok: true, id: verdict.id }
      : { ok: false, error: verdict.error }
}

/**
 * One round-trip to the Resend API: returns the success outcome or a
 * retryable backoff hint with the recommended wait duration + the
 * status that triggered it.
 * @param doFetch Injected fetch.
 * @param init Pre-built request init.
 * @returns Discriminated outcome.
 */
export const sendOnce = async (
  doFetch: typeof fetch,
  init: RequestInit
): Promise<SendResult | RetryHint> =>
  handleAttempt(await attempt(doFetch, init))
