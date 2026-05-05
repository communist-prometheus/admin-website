import { commitAndPush } from '../../git/remote/commit-and-push'
import { describeError } from '../shared/describe-error'
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
    return errorResponse(`Commit failed: ${describeError(err)}`, 500)
  }
}
