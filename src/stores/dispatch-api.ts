import { commsFetch, ensureOk } from './comms-http'

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

/**
 * POST /api/dispatch?force=1 — owner-only manual tick. Sends the
 * current digest to every active subscriber immediately. The cron
 * schedule is NOT modified; the next scheduled tick fires on its
 * own cadence. Throws on non-2xx, and on a malformed response body.
 * @returns Summary `{sent, failed, skipped, durationMs}`.
 */
export const apiForceDispatch = async (): Promise<ForceDispatchResult> => {
  const res = ensureOk(
    await commsFetch('/api/dispatch?force=1', { method: 'POST' }),
    'Force dispatch'
  )
  const body: unknown = await res.json().catch(() => undefined)
  return isForceDispatchResult(body)
    ? body
    : (() => {
        throw new Error('Force dispatch: malformed response')
      })()
}
