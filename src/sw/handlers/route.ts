import { Effect, Option, pipe } from 'effect'
import { log } from '../logging/logger'
import { routeAssetRequest } from './asset/route'
import { routeContentRequest } from './content/route'
import { routeFileRequest } from './file/route'
import { recoverAndRetry } from './recover-and-retry'
import type { RouteHandler } from './shared/first-match'
import { firstMatch } from './shared/first-match'
import { errorResponse } from './shared/json-response'

const routes: readonly RouteHandler[] = [
  routeFileRequest,
  routeAssetRequest,
  routeContentRequest,
]

const toMessage = (err: unknown): string =>
  err instanceof Error ? err.message : String(err)

const exec = (request: Request): Promise<Response> =>
  pipe(
    firstMatch(routes, new URL(request.url), request),
    Effect.map(Option.getOrElse(() => errorResponse('Not found', 404))),
    Effect.runPromise
  )

/**
 * Route request; on error wipe repo and retry once.
 * @param request - Incoming FetchEvent request
 * @returns Response from handler or recovery
 */
export const routeRequest = async (request: Request): Promise<Response> => {
  try {
    return await exec(request)
  } catch (err) {
    log('error', 'cache', `Handler error: ${toMessage(err)}`)
    return recoverAndRetry(request, exec)
  }
}
