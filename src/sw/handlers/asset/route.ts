import { handleCommit } from '../repo/commit'
import { handleAssetDelete } from './delete'
import { handleAssetList } from './list'
import { handleAssetRead } from './read'
import { handleAssetWrite } from './write'

const ASSET_PATH = '/api/github/asset'
const ASSETS_PATH = '/api/github/assets'
const COMMIT_PATH = '/api/github/commit'

/**
 * Route /api/github/asset* and /api/github/commit requests.
 * @param url - Parsed request URL
 * @param request - Original Request
 * @returns Response or undefined if not matched
 */
export const routeAssetRequest = async (
  url: URL,
  request: Request
): Promise<Response | undefined> => {
  const { pathname } = url
  const { method } = request

  if (pathname === ASSET_PATH && method === 'GET') {
    return handleAssetRead(url)
  }
  if (pathname === ASSET_PATH && method === 'POST') {
    return handleAssetWrite(request)
  }
  if (pathname === ASSET_PATH && method === 'DELETE') {
    return handleAssetDelete(request)
  }
  if (pathname === ASSETS_PATH && method === 'GET') {
    return handleAssetList(url)
  }
  if (pathname === COMMIT_PATH && method === 'POST') {
    return handleCommit(request)
  }

  return undefined
}
