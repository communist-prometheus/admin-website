import { blogEntries } from './blog-entries'
import { pageEntries } from './page-entries'
import { positionEntries } from './position-entries'

/**
 * Single mock file entry representing a file in the virtual FS.
 *
 * Expected content directory structure (mirrors public-website):
 *
 * ```
 *
 *   blog/                          <- nested: slug/index.lang.md
 *     {slug}/
 *       index.{en|ru|it|es}.md
 *       assets/                    <- optional media
 *         cover.jpg
 *         hero.svg
 *   pages/                         <- flat: slug.lang.md
 *     {slug}.{en|ru|it|es}.md
 *   positions/                     <- flat: slug.lang.md
 *     {slug}.{en|ru|it|es}.md
 * ```
 *
 * Blog frontmatter may reference assets via `image: ./assets/file`.
 * Blog body may embed assets via `![alt](./assets/file)`.
 */
export interface MockEntry {
  readonly path: string
  readonly content: string
}

/** All mock entries combined (blog + pages + positions) */
export const allMockEntries: readonly MockEntry[] = [
  ...blogEntries,
  ...pageEntries,
  ...positionEntries,
]
