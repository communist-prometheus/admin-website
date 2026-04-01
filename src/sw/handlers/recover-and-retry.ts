import { Effect } from 'effect'
import { freshClone } from '../git/sync/sync-helpers'
import { log } from '../logging/logger'
import { workerState } from '../state/state'

/**
 * Wipe corrupted repo, re-clone, retry the request.
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
    return route(request)
  } catch {
    return new Response('Recovery failed', { status: 503 })
  }
}
