import { serializeFrontmatter } from '../frontmatter'
import { commitAndPush } from '../git/commit-and-push'
import { writeAndStage } from '../git/write-file'
import { workerState } from '../state'
import { errorResponse, jsonResponse } from './json-response'
import { resolveContentPath } from './resolve-content-path'

/**
 * Handle POST /api/github/content — create or update content.
 * @param request - Incoming Request
 * @returns JSON response with { success, path }
 */
export const handleContentUpdate = async (
  request: Request
): Promise<Response> => {
  const body = await request.json()
  const { type, slug, lang, frontmatter, body: mdBody, message } = body

  if (!type || !slug || !lang || !message) {
    return errorResponse('Missing required fields', 400)
  }

  const base = workerState.config?.contentPath ?? 'src/content'
  const existing = await resolveContentPath(type, slug, lang)
  const path = existing ?? `${base}/${type}/${slug}.${lang}.md`
  const content = serializeFrontmatter(frontmatter, mdBody)

  await writeAndStage(path, content)
  await commitAndPush(message)

  return jsonResponse({ success: true, path })
}
