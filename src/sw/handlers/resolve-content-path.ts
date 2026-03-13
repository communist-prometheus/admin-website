import { listFilesUnder } from '../git/list-files'
import { workerState } from '../state'

/**
 * Resolve the actual file path for a content item.
 *
 * Content layout by type:
 * - blog:      nested — `blog/{slug}/{slug}.{lang}.md` (+ optional `assets/`)
 * - pages:     flat   — `pages/{slug}.{lang}.md`
 * - positions: flat   — `positions/{slug}.{lang}.md`
 *
 * @param type - Content type (blog, pages, positions)
 * @param slug - Content slug
 * @param lang - Language code
 * @returns Resolved file path or undefined
 */
export const resolveContentPath = async (
  type: string,
  slug: string,
  lang: string
): Promise<string | undefined> => {
  const base = workerState.config?.contentPath ?? 'src/content'
  const filename = `${slug}.${lang}.md`
  const files = await listFilesUnder(`${base}/${type}`)
  return files.find(f => f.endsWith(`/${filename}`))
}
