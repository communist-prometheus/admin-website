import type { Language } from './language'

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
 * Frontmatter metadata for common translations
 * (menu, labels)
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
