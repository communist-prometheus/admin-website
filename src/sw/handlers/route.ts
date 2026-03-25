import { Effect, Option, pipe } from 'effect'
import { log } from '../logging/logger'
import { routeAssetRequest } from './asset/route'
import { routeContentRequest } from './content/route'
import { routeFileRequest } from './file/route'
import type { RouteHandler } from './shared/first-match'
import { firstMatch } from './shared/first-match'
import { errorResponse } from './shared/json-response'

const routes: readonly RouteHandler[] = [
  routeFileRequest,
  routeAssetRequest,
  routeContentRequest,
]

/**
 * Extract a human-readable message from an error value.
 * @param err - Caught error value
 * @returns Human-readable error message
 */
const toMessage = (err: unknown): string =>
  err instanceof Error ? err.message : String(err)

/**
 * Route an intercepted /api/github/* request to a handler.
 * @param request - Incoming FetchEvent request
 * @returns Response from the matched handler
 */
export const routeRequest = (request: Request): Promise<Response> => {
  const url = new URL(request.url)
  log('info', 'cache', `${request.method} ${url.pathname}`)

  return pipe(
    firstMatch(routes, url, request),
    Effect.map(Option.getOrElse(() => errorResponse('Not found', 404))),
    Effect.catchAll(err => {
      log('error', 'cache', `Handler error: ${toMessage(err)}`)
      return Effect.succeed(errorResponse(toMessage(err), 500))
    }),
    Effect.runPromise
  )
}
