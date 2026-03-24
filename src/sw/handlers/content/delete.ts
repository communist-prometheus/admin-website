import { deleteAndUnstage } from '../../git/io/delete-git-file'
import { commitAndPush } from '../../git/remote/commit-and-push'
import { errorResponse, jsonResponse } from '../shared/json-response'
import { resolveContentPath } from './resolve-path'

/**
 * Handle DELETE /api/github/content/:type/:slug/:lang
 * @param type - Content type
 * @param slug - Content slug
 * @param lang - Language code
 * @param request - Incoming Request (body may contain sha)
 * @returns JSON response with { success, path }
 */
export const handleContentDelete = async (
  type: string,
  slug: string,
  lang: string,
  request: Request
): Promise<Response> => {
  await request.json().catch(() => ({}))

  const path = await resolveContentPath(type, slug, lang)
  if (!path) {
    return errorResponse(`File not found: ${slug}.${lang}.md`, 404)
  }

  await deleteAndUnstage(path)
  await commitAndPush(`Delete ${type}/${slug}.${lang}.md`)

  return jsonResponse({ success: true, path })
}
