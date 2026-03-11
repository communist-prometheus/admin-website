import { computeBlobSha } from '../git/blob-sha'
import { commitAndPush } from '../git/commit-and-push'
import { writeAndStage } from '../git/write-file'
import { errorResponse, jsonResponse } from './json-response'

/**
 * Handle POST /api/github/file — create new file.
 * @param request - Incoming Request
 * @returns JSON response with new SHA
 */
export const handleFileCreate = async (
  request: Request
): Promise<Response> => {
  const body = await request.json()
  const { path, content, message } = body

  if (!path || !content || !message) {
    return errorResponse('Missing required fields', 400)
  }

  await writeAndStage(path, content)
  const commitSha = await commitAndPush(message)
  const blobSha = await computeBlobSha(content)

  return jsonResponse({
    content: { sha: blobSha },
    commit: { sha: commitSha },
  })
}
