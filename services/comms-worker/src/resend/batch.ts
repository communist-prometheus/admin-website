import { classifyBatch } from './batch-classify'
import { RESEND_BATCH_URL } from './batch-request'
import { DEFAULT_BACKOFF_MS, type QuotaKind } from './response'

/** Discriminated outcome of one Resend batch round-trip. */
export type BatchVerdict =
  | { readonly kind: 'ok'; readonly ids: ReadonlyArray<string> }
  | {
      readonly kind: 'retry'
      readonly waitMs: number
      readonly status: number
      /** Set when the 429 was a quota rejection, not a rate-limit burst. */
      readonly quota?: QuotaKind
    }
  | { readonly kind: 'fail'; readonly error: string }

const attemptBatch = async (
  doFetch: typeof fetch,
  init: RequestInit
): Promise<Response | undefined> => {
  try {
    return await doFetch(RESEND_BATCH_URL, init)
  } catch {
    return undefined
  }
}

/**
 * One Resend batch round-trip: success (ids in input order), a
 * retryable hint (429 / 5xx / network → status 0), or a terminal
 * failure carrying the real status.
 * @param doFetch Injected fetch.
 * @param init Pre-built batch request init.
 * @returns Discriminated batch verdict.
 */
export const sendBatchOnce = async (
  doFetch: typeof fetch,
  init: RequestInit
): Promise<BatchVerdict> => {
  const res = await attemptBatch(doFetch, init)
  return res === undefined
    ? { kind: 'retry', waitMs: DEFAULT_BACKOFF_MS, status: 0 }
    : classifyBatch(res)
}
