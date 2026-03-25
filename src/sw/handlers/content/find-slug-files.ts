import { isNested } from './base'

/**
 * Match files belonging to a slug, regardless of layout.
 * @param files - All files under the type directory
 * @param type - Content type
 * @param slug - Slug to match
 * @returns Matching file paths
 */
export const findSlugFiles = (
  files: readonly string[],
  type: string,
  slug: string
): readonly string[] =>
  isNested(type)
    ? files.filter(f => f.includes(`/${slug}/`))
    : files.filter(f => {
        const name = f.split('/').pop() ?? ''
        return name.startsWith(`${slug}.`) && name.endsWith('.md')
      })
