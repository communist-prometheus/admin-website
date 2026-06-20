import { RESEND_BATCH_URL } from './batch-request'
import {
  DEFAULT_BACKOFF_MS,
  isRetryableStatus,
  retryAfterMs,
} from './response'

/** Discriminated outcome of one Resend batch round-trip. */
export type BatchVerdict =
  | { readonly kind: 'ok'; readonly ids: ReadonlyArray<string> }
  | {
      readonly kind: 'retry'
      readonly waitMs: number
      readonly status: number
    }
  | { readonly kind: 'fail'; readonly error: string }

const parseIds = (body: unknown): ReadonlyArray<string> => {
  const data = (body as { data?: unknown } | undefined)?.data
  if (!Array.isArray(data)) return []
  return data.map(e => {
    const id = (e as { id?: unknown } | null)?.id
    return typeof id === 'string' ? id : ''
  })
}

const classifyBatch = async (res: Response): Promise<BatchVerdict> => {
  if (res.ok) {
    const body = await res.json().catch(() => undefined)
    return { kind: 'ok', ids: parseIds(body) }
  }
  return isRetryableStatus(res.status)
    ? { kind: 'retry', waitMs: retryAfterMs(res), status: res.status }
    : { kind: 'fail', error: `resend ${res.status}` }
}

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
