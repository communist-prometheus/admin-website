import type { BatchVerdict } from './batch'
import { readErrorName } from './error-name'
import { readQuotaKind } from './quota'
import { isRetryableStatus, retryAfterMs } from './response'

/**
 * Resend's name for a 409 that will never settle: the key was already
 * used with a DIFFERENT payload, so the request was refused outright and
 * nothing was sent. Its sibling `concurrent_idempotent_requests` — the
 * identical request still in flight — is the only 409 worth waiting on.
 */
const PAYLOAD_MISMATCH = 'invalid_idempotent_request'

const parseIds = (body: unknown): ReadonlyArray<string> => {
  const data = (body as { data?: unknown } | undefined)?.data
  if (!Array.isArray(data)) return []
  return data.map(e => {
    const id = (e as { id?: unknown } | null)?.id
    return typeof id === 'string' ? id : ''
  })
}

/**
 * Read a Resend batch response into a {@link BatchVerdict}: success with
 * ids in input order, a retryable hint (carrying the quota when a 429 was
 * an account cap rather than a burst), or a terminal failure.
 * @param res The batch response.
 * @returns Discriminated verdict.
 */
export const classifyBatch = async (res: Response): Promise<BatchVerdict> => {
  if (res.ok) {
    const body = await res.json().catch(() => undefined)
    return { kind: 'ok', ids: parseIds(body) }
  }
  if (!isRetryableStatus(res.status))
    return { kind: 'fail', error: `resend ${res.status}` }
  if ((await readErrorName(res)) === PAYLOAD_MISMATCH)
    return { kind: 'fail', error: `resend ${res.status} ${PAYLOAD_MISMATCH}` }
  const quota = res.status === 429 ? await readQuotaKind(res) : undefined
  return {
    kind: 'retry',
    waitMs: retryAfterMs(res),
    status: res.status,
    ...(quota ? { quota } : {}),
  }
}
