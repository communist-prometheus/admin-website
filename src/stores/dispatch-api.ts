import { commsFetch, ensureOk, jsonHeaders } from './comms-http'

/** Shape of the `/api/dispatch?force=1` worker response. */
export type ForceDispatchResult = {
  readonly sent: number
  readonly failed: number
  readonly skipped: number
  readonly durationMs: number
}

const isObject = (x: unknown): x is Record<string, unknown> =>
  x !== null && typeof x === 'object'

const isForceDispatchResult = (
  value: unknown
): value is ForceDispatchResult =>
  isObject(value) &&
  typeof value['sent'] === 'number' &&
  typeof value['failed'] === 'number' &&
  typeof value['skipped'] === 'number' &&
  typeof value['durationMs'] === 'number'

const dispatchInit = (
  subscriberIds: readonly number[] | undefined
): RequestInit =>
  subscriberIds === undefined
    ? { method: 'POST' }
    : {
        method: 'POST',
        headers: jsonHeaders(),
        body: JSON.stringify({ subscriberIds }),
      }

/**
 * POST /api/dispatch?force=1 — owner-only manual tick. Sends the
 * current digest immediately. When `subscriberIds` is given the send
 * is targeted at exactly those recipients and the global cutoff is
 * left untouched; omitting it dispatches every active subscriber. The
 * cron schedule is never modified. Throws on non-2xx or a malformed
 * response body.
 * @param subscriberIds Recipient ids to target, or undefined for all.
 * @returns Summary `{sent, failed, skipped, durationMs}`.
 */
export const apiForceDispatch = async (
  subscriberIds?: readonly number[]
): Promise<ForceDispatchResult> => {
  const res = ensureOk(
    await commsFetch('/api/dispatch?force=1', dispatchInit(subscriberIds)),
    'Force dispatch'
  )
  const body: unknown = await res.json().catch(() => undefined)
  return isForceDispatchResult(body)
    ? body
    : (() => {
        throw new Error('Force dispatch: malformed response')
      })()
}
