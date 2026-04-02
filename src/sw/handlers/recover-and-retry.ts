import { Effect } from 'effect'
import { saveConfig } from '../git/repo/persist-config'
import { freshClone } from '../git/sync/sync-helpers'
import { log } from '../logging/logger'
import { workerState } from '../state/state'

/**
 * Wipe corrupted repo, re-clone, retry the request.
 * Re-saves config after wipe so autoRecover still works.
 * @param request - Original request to retry
 * @param route - Route handler to retry with
 * @returns Response from retried handler or 503
 */
export const recoverAndRetry = async (
  request: Request,
  route: (r: Request) => Promise<Response>
): Promise<Response> => {
  const config = workerState.config
  if (!config) return new Response('SW not configured', { status: 503 })
  log('warn', 'cache', 'Repo corrupted — wiping and re-cloning')
  try {
    await Effect.runPromise(freshClone(config))
    await saveConfig(config)
    return route(request)
  } catch {
    return new Response('Recovery failed', { status: 503 })
  }
}
