import { commitAndPush } from '../../git/remote/commit-and-push'
import { errorResponse, jsonResponse } from '../shared/json-response'

/**
 * Handle POST /api/github/commit — commit staged changes.
 * @param request - Incoming Request with { message }
 * @returns JSON response with { success, sha }
 */
export const handleCommit = async (request: Request): Promise<Response> => {
  try {
    const { message } = await request.json()
    if (!message) return errorResponse('Message required', 400)
    const sha = await commitAndPush(message)
    return jsonResponse({ success: true, sha })
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    return errorResponse(msg, 500)
  }
}
