import { listFilesUnder } from '../git/list-files'

const CONTENT_PATH_RE =
  /^(src\/content\/)([^/]+)\/([^/]+)\.(en|ru|it|es)\.md$/

/**
 * Resolve a flat content path to its actual nested location.
 * Tries both `slug/index.lang.md` and `slug/slug.lang.md`.
 * @param flatPath - Path as constructed by the editor
 * @returns Actual path or undefined if not found
 */
export const resolveFilePath = async (
  flatPath: string
): Promise<string | undefined> => {
  const m = flatPath.match(CONTENT_PATH_RE)
  if (!m) return undefined

  const [, base, type, slug, lang] = m
  const files = await listFilesUnder(`${base}${type}`)
  const candidates = [
    `${base}${type}/${slug}/index.${lang}.md`,
    `${base}${type}/${slug}/${slug}.${lang}.md`,
    `${base}${type}/${slug}.${lang}.md`,
  ]
  return candidates.find(c => files.includes(c))
}
