import { computeBlobSha } from '../git/blob-sha'
import { readRepoFile } from '../git/read-file'
import { errorResponse, jsonResponse } from './json-response'

/**
 * Handle GET /api/github/file?path=...
 * Returns file content matching server FileContent format.
 * @param url - Request URL with query params
 * @returns JSON response with file content
 */
export const handleFileRead = async (url: URL): Promise<Response> => {
  const path = url.searchParams.get('path')
  if (!path) return errorResponse('Path is required', 400)

  const content = await readRepoFile(path)
  const sha = await computeBlobSha(content)

  return jsonResponse({ path, content, sha })
}
