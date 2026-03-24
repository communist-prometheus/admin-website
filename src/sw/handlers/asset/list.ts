import { listFilesUnder } from '../../git/io/list-files'
import { detectMime } from '../shared/detect-mime'
import { errorResponse, jsonResponse } from '../shared/json-response'

/**
 * Extract filename from a full path.
 * @param filepath - Full file path
 * @returns Last segment
 */
const nameOf = (filepath: string): string =>
  filepath.split('/').pop() ?? filepath

/**
 * Handle GET /api/github/assets?prefix=...
 * Lists all files under the given prefix with MIME types.
 * @param url - Request URL with query params
 * @returns JSON array of { path, name, mimeType }
 */
export const handleAssetList = async (url: URL): Promise<Response> => {
  const prefix = url.searchParams.get('prefix')
  if (!prefix) return errorResponse('Prefix is required', 400)

  const files = await listFilesUnder(prefix)
  const items = files.map(f => ({
    path: f,
    name: nameOf(f),
    mimeType: detectMime(f),
  }))
  return jsonResponse(items)
}
