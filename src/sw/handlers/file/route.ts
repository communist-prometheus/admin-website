import { handleTree } from '../repo/tree'
import { handleFileCreate } from './create'
import { handleFileRead } from './read'
import { handleFileStage } from './stage'
import { handleFileUpdate } from './update'

/**
 * Route /api/github/tree, /api/github/file, and stage requests.
 * @param url - Parsed request URL
 * @param request - Original Request
 * @returns Response or undefined if not matched
 */
export const routeFileRequest = async (
  url: URL,
  request: Request
): Promise<Response | undefined> => {
  const { pathname } = url
  const { method } = request

  if (pathname === '/api/github/tree' && method === 'GET') {
    return handleTree(url)
  }

  if (pathname === '/api/github/file/stage' && method === 'PUT') {
    return handleFileStage(request)
  }

  if (pathname !== '/api/github/file') return undefined

  if (method === 'GET') return handleFileRead(url)
  if (method === 'POST') return handleFileCreate(request)
  if (method === 'PUT') return handleFileUpdate(request)

  return undefined
}
