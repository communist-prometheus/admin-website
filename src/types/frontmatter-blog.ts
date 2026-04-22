import type { Language } from './language'

/**
 * Frontmatter metadata for blog posts
 */
export interface BlogFrontmatter {
  readonly title: string
  readonly description: string
  readonly category: string
  readonly lang: Language
  readonly image?: string
  readonly published?: boolean
  readonly publishDate?: Date
}

/**
 * Frontmatter metadata for position documents
 */
export interface PositionFrontmatter {
  readonly title: string
  readonly description: string
  readonly lang: Language
  readonly published?: boolean
  readonly publishDate?: Date
}
