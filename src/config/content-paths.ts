import { getGitHubConfig } from './github'

/**
 * Join content root with segments, skipping empty root.
 * @param segments - Path segments to join
 * @returns Joined path without leading slash
 */
const join = (...segments: readonly string[]): string =>
  segments.filter(Boolean).join('/')

/**
 * Content root prefix from config.
 * @returns Root path or empty string
 */
const root = (): string => getGitHubConfig().contentPath

/**
 * Path to a content type directory.
 * @param type - blog, pages, or positions
 * @returns e.g. "blog" or "src/content/blog"
 */
export const typePath = (type: string): string => join(root(), type)

/**
 * Path to a blog article directory.
 * @param slug - Article slug
 * @returns e.g. "blog/my-post"
 */
export const blogDir = (slug: string): string => join(root(), 'blog', slug)

/**
 * Path to a blog article file.
 * @param slug - Article slug
 * @param lang - Language code
 * @returns e.g. "blog/my-post/index.en.md"
 */
export const blogFile = (slug: string, lang: string): string =>
  join(root(), 'blog', slug, `index.${lang}.md`)

/**
 * Path to a flat content file (pages/positions).
 * @param type - Content type
 * @param slug - Content slug
 * @param lang - Language code
 * @returns e.g. "pages/manifest.en.md"
 */
export const flatFile = (type: string, slug: string, lang: string): string =>
  join(root(), type, `${slug}.${lang}.md`)

/**
 * Path to blog assets directory.
 * @param slug - Article slug
 * @returns e.g. "blog/my-post/assets"
 */
export const assetDir = (slug: string): string =>
  join(root(), 'blog', slug, 'assets')

/**
 * Path to a specific blog asset file.
 * @param slug - Article slug
 * @param filename - Asset filename
 * @returns e.g. "blog/my-post/assets/hero.svg"
 */
export const assetFile = (slug: string, filename: string): string =>
  join(root(), 'blog', slug, 'assets', filename)

/**
 * Check if a path belongs to a content type.
 * @param path - File path to check
 * @param type - Content type
 * @returns True if path is under the type directory
 */
export const isTypePath = (path: string, type: string): boolean =>
  path.startsWith(`${typePath(type)}/`)
