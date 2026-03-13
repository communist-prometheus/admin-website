import { writeAndStage } from '../git/write-file'
import { errorResponse, jsonResponse } from './json-response'

/**
 * Handle PUT /api/github/file/stage — write + stage without commit.
 * @param request - Incoming Request with { path, content }
 * @returns JSON response with { success, path }
 */
export const handleFileStage = async (
  request: Request
): Promise<Response> => {
  const { path, content } = await request.json()
  if (!path || content === undefined) {
    return errorResponse('Path and content are required', 400)
  }

  await writeAndStage(path, content)
  return jsonResponse({ success: true, path })
}
