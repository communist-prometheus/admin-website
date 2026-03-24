/**
 * Supported content languages.
 * Runtime values are loaded from settings/languages.json via the settings store.
 * This constant provides a compile-time fallback.
 */
export const LANGUAGES = ['en', 'ru', 'it', 'es'] as const

/**
 * Language code type — string to support dynamic languages from settings
 */
export type Language = string

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
  readonly description?: string
  readonly lang: Language
  readonly heroTitle?: string
  readonly latestNews?: string
  readonly viewAllPosts?: string
  readonly heading?: string
  readonly allCategory?: string
  readonly readMore?: string
  readonly viewAll?: string
  readonly backToList?: string
}

/**
 * Frontmatter metadata for common translations (menu, labels)
 */
export interface CommonFrontmatter {
  readonly title: string
  readonly lang: Language
  readonly home?: string
  readonly blog?: string
  readonly positions?: string
  readonly manifest?: string
  readonly menu?: string
  readonly copyright?: string
  readonly readMore?: string
  readonly viewAll?: string
  readonly backToList?: string
}

/**
 * Available content types
 */
export type ContentType = 'blog' | 'positions' | 'pages' | 'common'

/** All valid content type values */
const CONTENT_TYPE_VALUES: readonly string[] = [
  'blog',
  'positions',
  'pages',
  'common',
]

/**
 * Type guard to narrow a string to ContentType.
 * @param value - String to check
 * @returns True if the value is a valid ContentType
 */
export const isContentType = (value: string): value is ContentType =>
  CONTENT_TYPE_VALUES.includes(value)

/**
 * Content types that use folder-based structure (slug/index.{lang}.md)
 */
export const NESTED_TYPES: ReadonlySet<ContentType> = new Set([
  'blog',
  'positions',
  'pages',
  'common',
])

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
