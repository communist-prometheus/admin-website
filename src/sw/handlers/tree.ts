import { computeBlobSha } from '../git/blob-sha'
import { listFilesUnder } from '../git/list-files'
import { readRepoFile } from '../git/read-file'
import { workerState } from '../state'
import { jsonResponse } from './json-response'

/**
 * Handle GET /api/github/tree?path=...
 * Returns array of tree items matching server format.
 * @param url - Request URL with query params
 * @returns JSON response with tree items
 */
export const handleTree = async (url: URL): Promise<Response> => {
  const fallback = workerState.config?.contentPath || '.'
  const path = url.searchParams.get('path') || fallback
  const files = await listFilesUnder(path)

  const items = await Promise.all(
    files.map(async filepath => {
      const content = await readRepoFile(filepath)
      const sha = await computeBlobSha(content)
      const name = filepath.split('/').pop() ?? filepath
      return { path: filepath, type: 'file', sha, size: content.length, name }
    })
  )

  return jsonResponse(items)
}
