import { writeAndStage } from '../../git/io/write-file'
import { commitAndPush } from '../../git/remote/commit-and-push'
import { serializeFrontmatter } from '../shared/frontmatter'
import { errorResponse, jsonResponse } from '../shared/json-response'
import { contentBase } from './base'
import { resolveContentPath } from './resolve-path'

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
