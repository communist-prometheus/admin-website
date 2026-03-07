/**
 * All supported content languages
 */
export const LANGUAGES = ['en', 'ru', 'it', 'es'] as const

/**
 * Supported content languages
 */
export type Language = (typeof LANGUAGES)[number]

/**
 * Frontmatter metadata for blog posts
 */
export interface BlogFrontmatter {
  readonly title: string
  readonly description: string
  readonly category: string
  readonly pubDate: Date
  readonly lang: Language
  readonly image?: string
}

/**
 * Frontmatter metadata for position documents
 */
export interface PositionFrontmatter {
  readonly title: string
  readonly description: string
  readonly order: number
  readonly lang: Language
}

/**
 * Frontmatter metadata for static pages
 */
export interface PageFrontmatter {
  readonly title: string
  readonly lang: Language
}

/**
 * Available content types
 */
export type ContentType = 'blog' | 'positions' | 'pages'

/**
 * Represents a content item with metadata
 */
export interface ContentItem {
  readonly path: string
  readonly slug: string
  readonly lang: Language
  readonly frontmatter:
    | BlogFrontmatter
    | PositionFrontmatter
    | PageFrontmatter
}
