import { computeBlobSha } from '../../git/blob-sha'
import { readRepoFile } from '../../git/io/read-file'
import { parseFrontmatter } from '../shared/frontmatter'
import { errorResponse, jsonResponse } from '../shared/json-response'
import { resolveContentPath } from './resolve-path'

/**
 * Handle GET /api/github/content/:type/:slug/:lang
 * @param type - Content type
 * @param slug - Content slug
 * @param lang - Language code
 * @returns JSON response with ContentItem
 */
export const handleContentGet = async (
  type: string,
  slug: string,
  lang: string
): Promise<Response> => {
  const path = await resolveContentPath(type, slug, lang)
  if (!path) {
    return errorResponse(`File not found: ${slug}.${lang}.md`, 404)
  }

  const raw = await readRepoFile(path)
  const { frontmatter, body } = parseFrontmatter(raw)
  const sha = await computeBlobSha(raw)
  return jsonResponse({ type, slug, path, frontmatter, body, sha })
}
