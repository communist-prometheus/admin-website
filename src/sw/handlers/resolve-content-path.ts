import { listFilesUnder } from '../git/list-files'
import { workerState } from '../state'

/**
 * Resolve the actual file path for a content item.
 * Supports both flat (slug.lang.md) and nested (slug/slug.lang.md)
 * directory layouts.
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
