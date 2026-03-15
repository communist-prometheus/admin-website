import { commitAndPush } from '../git/commit-and-push'
import { errorResponse, jsonResponse } from './json-response'
import { renameBlogSlug } from './rename-blog-slug'
import { renameFlatSlug } from './rename-flat-slug'

/**
 * Handle POST /api/github/content/rename
 * @param request - Request with { type, oldSlug, newSlug }
 * @returns JSON response
 */
export const handleContentRename = async (
  request: Request
): Promise<Response> => {
  const { type, oldSlug, newSlug } = await request.json()
  if (!type || !oldSlug || !newSlug)
    return errorResponse('type, oldSlug, newSlug required', 400)

  const count =
    type === 'blog'
      ? await renameBlogSlug(oldSlug, newSlug)
      : await renameFlatSlug(type, oldSlug, newSlug)

  if (count === 0)
    return errorResponse(`No files found for ${type}/${oldSlug}`, 404)

  await commitAndPush(`Rename ${type}/${oldSlug} to ${newSlug}`)
  return jsonResponse({ success: true, count })
}
