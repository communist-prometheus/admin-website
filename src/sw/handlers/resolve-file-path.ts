import { listFilesUnder } from '../git/list-files'

const CONTENT_PATH_RE =
  /^(src\/content\/)([^/]+)\/([^/]+)\.(en|ru|it|es)\.md$/

/**
 * Resolve a flat content path to its actual nested location.
 * E.g. `src/content/blog/slug.en.md` → `src/content/blog/slug/slug.en.md`
 * @param flatPath - Path as constructed by the editor
 * @returns Actual path or undefined if not found
 */
export const resolveFilePath = async (
  flatPath: string
): Promise<string | undefined> => {
  const m = flatPath.match(CONTENT_PATH_RE)
  if (!m) return undefined

  const [, base, type] = m
  const filename = flatPath.split('/').pop()
  if (!filename) return undefined

  const files = await listFilesUnder(`${base}${type}`)
  return files.find(f => f.endsWith(`/${filename}`))
}
