import { log } from '../logging/logger'
import { routeAssetRequest } from './asset/route'
import { routeContentRequest } from './content/route'
import { routeFileRequest } from './file/route'
import { errorResponse } from './shared/json-response'

/**
 * Route an intercepted /api/github/* request to a handler.
 * @param request - Incoming FetchEvent request
 * @returns Response from the matched handler
 */
export const routeRequest = async (request: Request): Promise<Response> => {
  const url = new URL(request.url)
  log('info', 'cache', `${request.method} ${url.pathname}`)

  try {
    const fileResp = await routeFileRequest(url, request)
    if (fileResp) return fileResp

    const assetResp = await routeAssetRequest(url, request)
    if (assetResp) return assetResp

    const contentResp = await routeContentRequest(url, request)
    if (contentResp) return contentResp

    return errorResponse('Not found', 404)
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    log('error', 'cache', `Handler error: ${msg}`)
    return errorResponse(msg, 500)
  }
}
