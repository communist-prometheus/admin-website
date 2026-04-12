import { Effect } from 'effect'
import { saveConfig } from '../git/repo/persist-config'
import { freshClone } from '../git/sync/sync-helpers'
import { log } from '../logging/logger'
import { workerState } from '../state/state'
import { errorResponse } from './shared/json-response'

const toMessage = (err: unknown): string =>
  err instanceof Error ? err.message : String(err)

/**
 * Wipe corrupted repo, re-clone, retry the request.
 * Re-saves config after wipe so autoRecover still works.
 *
 * All failure paths return JSON `{ error }` (not text) so the client-side
 * `decodeResponse` can extract a readable message instead of crashing on
 * `response.json()` with a SyntaxError. The retry itself is awaited inside
 * a try/catch so that inner rejections surface as JSON errors as well.
 * @param request - Fresh clone of the original request with an unconsumed body
 * @param route - Route handler to retry with
 * @returns Response from retried handler or JSON error
 */
export const recoverAndRetry = async (
  request: Request,
  route: (r: Request) => Promise<Response>
): Promise<Response> => {
  const config = workerState.config
  if (!config) {
    return errorResponse('SW not configured', 503)
  }
  log('warn', 'cache', 'Repo corrupted — wiping and re-cloning')
  try {
    await Effect.runPromise(freshClone(config))
    await saveConfig(config)
  } catch (err) {
    log('error', 'cache', `Recovery clone failed: ${toMessage(err)}`)
    return errorResponse(`Recovery failed: ${toMessage(err)}`, 503)
  }
  try {
    return await route(request)
  } catch (err) {
    log('error', 'cache', `Retry after recovery failed: ${toMessage(err)}`)
    return errorResponse(`Retry failed: ${toMessage(err)}`, 500)
  }
}
