import { Effect, Option, pipe } from 'effect'
import { log } from '../logging/logger'
import { handleGetRole } from '../rbac/handle-role'
import { routeAssetRequest } from './asset/route'
import { routeContentRequest } from './content/route'
import { routeFileRequest } from './file/route'
import { recoverAndRetry } from './recover-and-retry'
import type { RouteHandler } from './shared/first-match'
import { firstMatch } from './shared/first-match'
import { errorResponse } from './shared/json-response'

const routeRbacRequest: RouteHandler = async url =>
  url.pathname === '/api/github/role' ? handleGetRole() : undefined

const routes: readonly RouteHandler[] = [
  routeRbacRequest,
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
 *
 * The request is cloned BEFORE exec so the retry path has an unconsumed
 * body. Without this, any POST/PUT whose handler reads the body and then
 * throws would hit a "body already used" TypeError on retry, which the
 * SW_FETCH wrapper serializes as a JSON `{ error }` payload — the client's
 * success-schema decoder then fails with the misleading "content is
 * missing" Schema error that masks the real cause.
 * @param request - Incoming FetchEvent request
 * @returns Response from handler or recovery
 */
export const routeRequest = async (request: Request): Promise<Response> => {
  const replay = request.clone()
  try {
    return await exec(request)
  } catch (err) {
    log('error', 'cache', `Handler error: ${toMessage(err)}`)
    return recoverAndRetry(replay, exec)
  }
}
