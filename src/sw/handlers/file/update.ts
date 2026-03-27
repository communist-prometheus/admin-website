import { computeBlobSha } from '../../git/blob-sha'
import { writeAndStage } from '../../git/io/write-file'
import { commitAndPush } from '../../git/remote/commit-and-push'
import { errorResponse, jsonResponse } from '../shared/json-response'

/**
 * Handle PUT /api/github/file — update existing file.
 * @param request - Incoming Request
 * @returns JSON response with new SHA
 */
export const handleFileUpdate = async (
  request: Request
): Promise<Response> => {
  const body = await request.json()
  const { path, content, message } = body

  if (!path || !content || !message) {
    return errorResponse('Missing required fields', 400)
  }

  try {
    await writeAndStage(path, content)
    const commitSha = await commitAndPush(message)
    const blobSha = await computeBlobSha(content)

    return jsonResponse({
      content: { sha: blobSha },
      commit: { sha: commitSha },
    })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    return errorResponse(`Write failed: ${msg}`, 500)
  }
}
