/**
 * GitHub content types for communist-prometheus/public-website repository
 */

export type ContentLanguage = 'en' | 'ru' | 'it' | 'es'

export type ContentType = 'blog' | 'pages' | 'positions'

/**
 * Base frontmatter fields common to all content types
 */
export interface BaseFrontmatter {
  title: string
  lang: ContentLanguage
}

/**
 * Blog post frontmatter
 */
export interface BlogFrontmatter extends BaseFrontmatter {
  description: string
  category: string
  pubDate: string
  image?: string
}

/**
 * Page frontmatter
 */
export interface PageFrontmatter extends BaseFrontmatter {
  title: string
  lang: ContentLanguage
}

/**
 * Position frontmatter
 */
export interface PositionFrontmatter extends BaseFrontmatter {
  description: string
  order: number
}

/**
 * Union type for all frontmatter types
 */
export type ContentFrontmatter =
  | BlogFrontmatter
  | PageFrontmatter
  | PositionFrontmatter

/**
 * Content item with parsed frontmatter and body
 */
export interface ContentItem<
  T extends ContentFrontmatter = ContentFrontmatter,
> {
  type: ContentType
  slug: string
  path: string
  frontmatter: T
  body: string
  sha?: string
}

/**
 * GitHub file content from API
 */
export interface GitHubFileContent {
  name: string
  path: string
  sha: string
  size: number
  url: string
  html_url: string
  git_url: string
  download_url: string | null
  type: 'file' | 'dir'
  content?: string
  encoding?: string
}

/**
 * Request to create or update content
 */
export interface ContentUpdateRequest {
  type: ContentType
  slug: string
  lang: ContentLanguage
  frontmatter: ContentFrontmatter
  body: string
  message: string
  sha?: string
}
