import { Either } from 'effect'
import { isContentType } from '@/types/content'
import { validateFrontmatter } from '@/validation/schemas/frontmatter'
import { parseFrontmatterStrict } from '../shared/frontmatter'

const CONTENT_MD_RE =
  /^src\/content\/([^/]+)\/[^/]+\/index\.(en|ru|it|es)\.md$/

/**
 * When the staged file is a content markdown under
 * `src/content/<type>/<slug>/index.<lang>.md`:
 *   1) ensure the frontmatter actually parses as YAML — surfaces
 *      "bad indentation of a mapping entry" before it reaches git
 *      and takes prod red,
 *   2) run the per-type schema.
 * Non-content paths (assets, labels, settings) pass through
 * unchecked.
 *
 * @param path resolved path being staged
 * @param content full file body, including YAML frontmatter
 * @returns error message or undefined when safe to stage
 */
export const guardStagePayload = (
  path: string,
  content: string
): string | undefined => {
  const m = path.match(CONTENT_MD_RE)
  if (!m) return undefined
  const type = m[1]
  if (!type || !isContentType(type)) return undefined
  let frontmatter: Record<string, unknown>
  try {
    frontmatter = parseFrontmatterStrict(content)
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    return `frontmatter is not valid YAML — ${msg}`
  }
  const r = validateFrontmatter(type, frontmatter)
  return Either.isLeft(r) ? r.left : undefined
}
