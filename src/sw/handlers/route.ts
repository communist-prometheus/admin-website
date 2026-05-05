import { Effect, Option, pipe } from 'effect'
import { log } from '../logging/logger'
import { routeAssetRequest } from './asset/route'
import { routeContentRequest } from './content/route'
import { routeFileRequest } from './file/route'
import { recoverAndRetry } from './recover-and-retry'
import { matchRbacRoute } from './route-rbac'
import { describeError } from './shared/describe-error'
import type { RouteHandler } from './shared/first-match'
import { firstMatch } from './shared/first-match'
import { errorResponse } from './shared/json-response'

const routeRbacRequest: RouteHandler = async (url, request) =>
  Option.match(matchRbacRoute(url.pathname, request.method, request), {
    onNone: () => undefined,
    onSome: p => p,
  })

const routes: readonly RouteHandler[] = [
  routeRbacRequest,
  routeFileRequest,
  routeAssetRequest,
  routeContentRequest,
]

const exec = (request: Request): Promise<Response> =>
  pipe(
    firstMatch(routes, new URL(request.url), request),
    Effect.map(Option.getOrElse(() => errorResponse('Not found', 404))),
    Effect.runPromise
  )

/**
 * Route request; on error wipe repo and retry once. The request is
 * cloned before exec so a handler that consumed its body still has
 * an unused replay body for the retry path.
 *
 * @param request incoming FetchEvent request
 * @returns response from handler or recovery
 */
export const routeRequest = async (request: Request): Promise<Response> => {
  const replay = request.clone()
  return exec(request).catch(err => {
    log('error', 'cache', `Handler error: ${describeError(err)}`)
    return recoverAndRetry(replay, exec)
  })
}
