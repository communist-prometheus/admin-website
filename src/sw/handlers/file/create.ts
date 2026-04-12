import { computeBlobSha } from '../../git/blob-sha'
import { writeAndStage } from '../../git/io/write-file'
import { commitAndPush } from '../../git/remote/commit-and-push'
import { log } from '../../logging/logger'
import { errorResponse, jsonResponse } from '../shared/json-response'

interface CreateFileBody {
  readonly path?: string
  readonly content?: string
  readonly message?: string
}

const performCreate = async (
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
 * Handle POST /api/github/file — create new file.
 * Any filesystem, commit, or push error is surfaced as a
 * JSON `{ error }` response rather than an unhandled rejection,
 * so the client can display a meaningful message instead of a
 * schema decode error for a missing `content` field.
 * @param request - Incoming Request
 * @returns JSON response with new SHA, or error payload on failure
 */
export const handleFileCreate = async (
  request: Request
): Promise<Response> => {
  const body: CreateFileBody = await request.json()
  const { path, content, message } = body

  if (!path || !content || !message) {
    return errorResponse('Missing required fields', 400)
  }

  try {
    const { commitSha, blobSha } = await performCreate(path, content, message)
    return jsonResponse({
      content: { sha: blobSha },
      commit: { sha: commitSha },
    })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    log('error', 'cache', `file create failed for ${path}: ${msg}`)
    return errorResponse(`Failed to create file: ${msg}`, 500)
  }
}
