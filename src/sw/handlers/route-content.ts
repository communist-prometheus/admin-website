import { handleContentDelete } from './content-delete'
import { handleContentGet } from './content-get'
import { handleContentList } from './content-list'
import { handleContentUpdate } from './content-update'
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

  if (pathname === '/api/github/content' && method === 'POST') {
    return handleContentUpdate(request)
  }

  const match = matchContent(pathname)
  if (!match) return undefined

  if (match.kind === 'list' && method === 'GET') {
    return handleContentList(match.type)
  }

  if (match.kind === 'item' && method === 'GET') {
    return handleContentGet(match.type, match.slug, match.lang)
  }

  if (match.kind === 'item' && method === 'DELETE') {
    return handleContentDelete(match.type, match.slug, match.lang, request)
  }

  return undefined
}
