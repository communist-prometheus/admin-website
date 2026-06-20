import type { SendResult } from './types'

/** Default backoff used when the server does not send Retry-After. */
export const DEFAULT_BACKOFF_MS = 1_000

/** Status codes that are eligible for a single retry. */
export const isRetryableStatus = (status: number): boolean =>
  status === 429 || status >= 500

/**
 * Read `Retry-After` (seconds) from a response, falling back to the
 * default backoff when absent or unparseable.
 * @param res The fetch response.
 * @returns Wait in milliseconds.
 */
export const retryAfterMs = (res: Response): number => {
  const raw = res.headers.get('Retry-After')
  const seconds = raw === null ? Number.NaN : Number(raw)
  return Number.isFinite(seconds) && seconds > 0
    ? seconds * 1_000
    : DEFAULT_BACKOFF_MS
}

/**
 * Decide how to handle a Resend response: success, retryable failure
 * (with its backoff duration), or a terminal error.
 * @param res The fetch response.
 * @returns Branch the caller should take.
 */
export const classify = async (
  res: Response
): Promise<
  | { readonly kind: 'ok'; readonly id: string }
  | {
      readonly kind: 'retry'
      readonly waitMs: number
      readonly status: number
    }
  | { readonly kind: 'fail'; readonly error: string }
> => {
  if (res.ok) {
    const body = (await res.json().catch(() => undefined)) as
      | { id?: unknown }
      | undefined
    const id = typeof body?.id === 'string' ? body.id : ''
    return { kind: 'ok', id }
  }
  return isRetryableStatus(res.status)
    ? { kind: 'retry', waitMs: retryAfterMs(res), status: res.status }
    : { kind: 'fail', error: `resend ${res.status}` }
}

/**
 * Format the terminal error when a retryable failure (429 / 5xx /
 * network) survives the single retry — keeps the real status instead
 * of the old opaque "retry exhausted".
 * @param status HTTP status of the last attempt; 0 means a network error.
 * @returns Diagnostic error string.
 */
export const exhaustedError = (status: number): string =>
  `resend ${status === 0 ? 'network' : status} (retry exhausted)`

/** Promote a `classify` outcome into the public {@link SendResult} shape. */
export const toResult = (kind: 'ok' | 'fail', payload: string): SendResult =>
  kind === 'ok' ? { ok: true, id: payload } : { ok: false, error: payload }
