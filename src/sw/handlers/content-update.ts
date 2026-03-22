import { serializeFrontmatter } from '../frontmatter'
import { commitAndPush } from '../git/commit-and-push'
import { writeAndStage } from '../git/write-file'
import { contentBase } from './content-base'
import { errorResponse, jsonResponse } from './json-response'
import { resolveContentPath } from './resolve-content-path'

const NESTED_TYPES = new Set(['blog', 'positions', 'pages', 'common'])

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

  const base = contentBase(type)
  const existing = await resolveContentPath(type, slug, lang)
  const isNested = NESTED_TYPES.has(type)
  const newPath = isNested
    ? `${base}/${slug}/index.${lang}.md`
    : `${base}/${slug}.${lang}.md`
  const path = existing ?? newPath
  const content = serializeFrontmatter(frontmatter, mdBody)

  await writeAndStage(path, content)
  await commitAndPush(message)

  return jsonResponse({ success: true, path })
}
