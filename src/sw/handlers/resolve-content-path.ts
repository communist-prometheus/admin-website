import { listFilesUnder } from '../git/list-files'
import { contentBase } from './content-base'

/**
 * Resolve the actual file path for a content item.
 *
 * Content layout by type:
 * - blog:      nested — `blog/{slug}/index.{lang}.md`
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
  const base = contentBase(type)
  const candidates = [
    `${base}/${slug}/index.${lang}.md`,
    `${base}/${slug}.${lang}.md`,
  ]
  const files = await listFilesUnder(base)
  return candidates.find(c => files.includes(c))
}
