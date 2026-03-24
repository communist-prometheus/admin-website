import { commitAndPush } from '../../git/remote/commit-and-push'
import { renameNestedSlug } from '../file/rename/blog-slug'
import { renameFlatSlug } from '../file/rename/flat-slug'
import { errorResponse, jsonResponse } from '../shared/json-response'

const NESTED_TYPES = new Set(['blog', 'positions', 'pages', 'common'])

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

  const count = NESTED_TYPES.has(type)
    ? await renameNestedSlug(type, oldSlug, newSlug)
    : await renameFlatSlug(type, oldSlug, newSlug)

  if (count === 0)
    return errorResponse(`No files found for ${type}/${oldSlug}`, 404)

  await commitAndPush(`Rename ${type}/${oldSlug} to ${newSlug}`)
  return jsonResponse({ success: true, count })
}
