import { computeBlobSha } from '../git/blob-sha'
import { readRepoFile } from '../git/read-file'
import { errorResponse, jsonResponse } from './json-response'
import { resolveFilePath } from './resolve-file-path'

/**
 * Try reading a file, falling back to resolved path.
 * @param path - Requested file path
 * @returns Content string or undefined
 */
const tryRead = async (
  path: string
): Promise<{ content: string; resolved: string } | undefined> => {
  try {
    return { content: await readRepoFile(path), resolved: path }
  } catch {
    const alt = await resolveFilePath(path)
    if (!alt) return undefined
    return { content: await readRepoFile(alt), resolved: alt }
  }
}

/**
 * Handle GET /api/github/file?path=...
 * Returns file content matching server FileContent format.
 * @param url - Request URL with query params
 * @returns JSON response with file content
 */
export const handleFileRead = async (url: URL): Promise<Response> => {
  const path = url.searchParams.get('path')
  if (!path) return errorResponse('Path is required', 400)

  const result = await tryRead(path)
  if (!result) return errorResponse(`File not found: ${path}`, 404)

  const sha = await computeBlobSha(result.content)
  return jsonResponse({
    path: result.resolved,
    content: result.content,
    sha,
  })
}
