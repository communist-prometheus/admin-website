import type { SWFetchResponse } from '../../protocol'
import { workerState } from '../../state/state'

/**
 * The MessageChannel transport bypasses the fetch listener, so it needs the
 * same confused-deputy nonce check: a `/api/github/*` WRITE proxy must echo the
 * per-session nonce issued at init. Reads (GET) are left open, matching the
 * native-path guard.
 * @param request - The reconstructed proxied request
 * @returns True when the request is a read or carries the current nonce
 */
export const nonceOk = (request: Request): boolean =>
  request.method === 'GET' ||
  (request.headers.get('X-SW-Nonce') === workerState.nonce &&
    workerState.nonce !== undefined)

/** The 403 payload returned when a SW_FETCH github proxy lacks the nonce. */
export const nonceRejection: SWFetchResponse = {
  status: 403,
  body: JSON.stringify({ error: 'SW nonce required' }),
  headers: { 'content-type': 'application/json' },
}
