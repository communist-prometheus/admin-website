import { computeBlobSha } from '../../git/blob-sha'
import { writeAndStage } from '../../git/io/write-file'
import { commitAndPush } from '../../git/remote/commit-and-push'
import { log } from '../../logging/logger'
import { describeError } from '../shared/describe-error'
import { errorResponse, jsonResponse } from '../shared/json-response'

interface UpdateFileBody {
  readonly path?: string
  readonly content?: string
  readonly sha?: string
  readonly message?: string
}

const performUpdate = async (
  path: string,
  content: string,
  message: string
) => {
  await writeAndStage(path, content)
  const commitSha = await commitAndPush(message)
  const blobSha = await computeBlobSha(content)
  return { commitSha, blobSha }
}

/**
 * Handle PUT /api/github/file — update existing file.
 * Errors from the filesystem, commit, or push stages are returned as
 * `{ error }` JSON payloads so clients can surface them instead of
 * receiving an unrelated schema decode error.
 * @param request - Incoming Request
 * @returns JSON response with new SHA, or error payload on failure
 */
export const handleFileUpdate = async (
  request: Request
): Promise<Response> => {
  const body: UpdateFileBody = await request.json()
  const { path, content, message } = body

  if (!path || !content || !message) {
    return errorResponse('Missing required fields', 400)
  }

  try {
    const { commitSha, blobSha } = await performUpdate(path, content, message)
    return jsonResponse({
      content: { sha: blobSha },
      commit: { sha: commitSha },
    })
  } catch (err) {
    const msg = describeError(err)
    log('error', 'cache', `file update failed for ${path}: ${msg}`)
    return errorResponse(`Failed to update file: ${msg}`, 500)
  }
}
