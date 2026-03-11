import { parseFrontmatter } from '../frontmatter'
import { computeBlobSha } from '../git/blob-sha'
import { listFilesUnder } from '../git/list-files'
import { readRepoFile } from '../git/read-file'
import { workerState } from '../state'
import { jsonResponse } from './json-response'
import { basename, parseSlug } from './parse-slug'

/**
 * Build a ContentItem from a file path and its content.
 * @param type - Content type (blog, pages, positions)
 * @param filepath - Full file path
 * @returns ContentItem matching server response format
 */
const buildItem = async (type: string, filepath: string) => {
  const raw = await readRepoFile(filepath)
  const { frontmatter, body } = parseFrontmatter(raw)
  const sha = await computeBlobSha(raw)
  const slug = parseSlug(basename(filepath))

  return { type, slug, path: filepath, frontmatter, body, sha }
}

/**
 * Handle GET /api/github/content/:type
 * @param type - Content type from URL
 * @returns JSON response with { items: ContentItem[] }
 */
export const handleContentList = async (type: string): Promise<Response> => {
  const contentPath = workerState.config?.contentPath ?? 'src/content'
  const files = await listFilesUnder(`${contentPath}/${type}`)
  const mdFiles = files.filter(f => f.endsWith('.md'))
  const items = await Promise.all(mdFiles.map(f => buildItem(type, f)))
  return jsonResponse({ items })
}
