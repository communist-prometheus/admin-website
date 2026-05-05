import { computeBlobSha } from '../../git/blob-sha'
import { writeAndStage } from '../../git/io/write-file'
import { log } from '../../logging/logger'
import { describeError } from '../shared/describe-error'
import { errorResponse, jsonResponse } from '../shared/json-response'

interface CreateFileBody {
  readonly path?: string
  readonly content?: string
  readonly message?: string
}

/**
 * Handle POST /api/github/file — stage a new file.
 * Does NOT commit or push. The client calls /api/github/commit
 * separately so the deploy flow is unified across create/update/delete.
 * @param request - Incoming Request
 * @returns JSON response with blob SHA
 */
export const handleFileCreate = async (
  request: Request
): Promise<Response> => {
  const body: CreateFileBody = await request.json()
  const { path, content } = body

  if (!path || !content) {
    return errorResponse('Missing required fields', 400)
  }

  try {
    await writeAndStage(path, content)
    const blobSha = await computeBlobSha(content)
    return jsonResponse({
      content: { sha: blobSha },
      staged: true,
    })
  } catch (err) {
    const msg = describeError(err)
    log('error', 'cache', `file create failed for ${path}: ${msg}`)
    return errorResponse(`Failed to create file: ${msg}`, 500)
  }
}
