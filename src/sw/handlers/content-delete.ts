import { commitAndPush } from '../git/commit-and-push'
import { deleteAndUnstage } from '../git/delete-git-file'
import { workerState } from '../state'
import { errorResponse, jsonResponse } from './json-response'

/**
 * Handle DELETE /api/github/content/:type/:slug/:lang
 * @param type - Content type
 * @param slug - Content slug
 * @param lang - Language code
 * @param request - Incoming Request (body contains sha)
 * @returns JSON response with { success, path }
 */
export const handleContentDelete = async (
  type: string,
  slug: string,
  lang: string,
  request: Request
): Promise<Response> => {
  const { sha } = await request.json()
  if (!sha) return errorResponse('SHA is required', 400)

  const base = workerState.config?.contentPath ?? 'src/content'
  const path = `${base}/${type}/${slug}.${lang}.md`
  const message = `Delete ${type}/${slug}.${lang}.md`

  await deleteAndUnstage(path)
  await commitAndPush(message)

  return jsonResponse({ success: true, path })
}
