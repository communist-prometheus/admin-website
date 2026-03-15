import { handleContentRename } from './content-rename'
import { handleContentUpdate } from './content-update'
import { dispatchContent } from './dispatch-content'
import { matchContent } from './match-content'

/**
 * Route /api/github/content/* requests.
 * @param url - Parsed request URL
 * @param request - Original Request
 * @returns Response or undefined if not matched
 */
export const routeContentRequest = async (
  url: URL,
  request: Request
): Promise<Response | undefined> => {
  const { pathname } = url
  const { method } = request

  if (pathname === '/api/github/content' && method === 'POST')
    return handleContentUpdate(request)
  if (pathname === '/api/github/content/rename' && method === 'POST')
    return handleContentRename(request)

  const match = matchContent(pathname)
  if (!match) return undefined
  return dispatchContent(match, method, request)
}
