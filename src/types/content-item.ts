import type { Language } from './language'

/**
 * Runtime frontmatter shape from API.
 * Downstream consumers narrow via `in` + typeof checks.
 */
export type Frontmatter = Readonly<Record<string, unknown>>

/**
 * Represents a content item with metadata
 */
export interface ContentItem {
  readonly path: string
  readonly slug: string
  readonly lang: Language
  readonly frontmatter: Frontmatter
}
