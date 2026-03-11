import { parseFrontmatter } from '../frontmatter'
import { computeBlobSha } from '../git/blob-sha'
import { readRepoFile } from '../git/read-file'
import { workerState } from '../state'
import { errorResponse, jsonResponse } from './json-response'

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
  const base = workerState.config?.contentPath ?? 'src/content'
  const path = `${base}/${type}/${slug}.${lang}.md`

  try {
    const raw = await readRepoFile(path)
    const { frontmatter, body } = parseFrontmatter(raw)
    const sha = await computeBlobSha(raw)
    return jsonResponse({ type, slug, path, frontmatter, body, sha })
  } catch {
    return errorResponse(`File not found: ${path}`, 404)
  }
}
