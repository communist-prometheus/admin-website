import { deleteAndUnstage } from '../git/delete-git-file'
import { errorResponse, jsonResponse } from './json-response'

/**
 * Handle DELETE /api/github/asset — delete an asset file.
 * @param request - Incoming Request with { path }
 * @returns JSON response with { success }
 */
export const handleAssetDelete = async (
  request: Request
): Promise<Response> => {
  const { path } = await request.json()
  if (!path) return errorResponse('Path is required', 400)

  await deleteAndUnstage(path)
  return jsonResponse({ success: true })
}
