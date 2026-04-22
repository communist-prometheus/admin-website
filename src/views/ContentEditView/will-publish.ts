import type { ContentType } from '@/types/content'

const AUTO_PUBLIC: ReadonlySet<ContentType> = new Set(['pages', 'common'])

/**
 * Whether committing this frontmatter now makes the content publicly
 * visible on the next site build.
 *
 * Rules:
 * - `pages` and `common` have no publish gate — every save is a
 *   publication.
 * - For the other content types, a save is a publication only when
 *   `frontmatter.published === true`.
 *
 * @param type content type being saved
 * @param frontmatter live frontmatter snapshot
 * @returns true when Save will make the content live
 */
export const willPublish = (
  type: ContentType,
  frontmatter: Record<string, unknown>
): boolean => {
  if (AUTO_PUBLIC.has(type)) return true
  return frontmatter['published'] === true
}
