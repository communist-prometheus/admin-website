import { commitAndPush } from '../../git/remote/commit-and-push'
import { errorResponse, jsonResponse } from '../shared/json-response'

/**
 * Handle POST /api/github/commit — commit staged changes.
 * @param request - Incoming Request with { message }
 * @returns JSON response with { success, sha }
 */
export const handleCommit = async (request: Request): Promise<Response> => {
  const { message } = await request.json()
  if (!message) return errorResponse('Message is required', 400)

  try {
    const sha = await commitAndPush(message)
    return jsonResponse({ success: true, sha })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    return errorResponse(`Commit failed: ${msg}`, 500)
  }
}
