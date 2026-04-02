import { getGitHubConfig } from './github'

const NESTED_TYPES = new Set(['blog', 'positions', 'pages', 'common'])

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
 * @param type - blog, pages, positions, or nav
 * @returns e.g. "blog" or "src/content/blog"
 */
export const typePath = (type: string): string => join(root(), type)

/**
 * Path to a nested content item directory.
 * @param type - Content type (blog, pages, positions)
 * @param slug - Content slug
 * @returns e.g. "blog/my-post" or "positions/digital-sovereignty"
 */
export const nestedDir = (type: string, slug: string): string =>
  join(root(), type, slug)

/**
 * Path to a nested content item file.
 * @param type - Content type (blog, pages, positions)
 * @param slug - Content slug
 * @param lang - Language code
 * @returns e.g. "blog/my-post/index.en.md" or "pages/home/index.en.md"
 */
export const nestedFile = (
  type: string,
  slug: string,
  lang: string
): string => join(root(), type, slug, `index.${lang || 'en'}.md`)

/**
 * Path to a flat content file (nav).
 * @param type - Content type
 * @param slug - Content slug
 * @param lang - Language code
 * @returns e.g. "nav/index.en.md"
 */
export const flatFile = (type: string, slug: string, lang: string): string =>
  join(root(), type, `${slug}.${lang}.md`)

/**
 * Path to a content file, dispatching by type.
 * @param type - Content type
 * @param slug - Content slug
 * @param lang - Language code
 * @returns Nested or flat file path
 */
export const contentFile = (
  type: string,
  slug: string,
  lang: string
): string =>
  NESTED_TYPES.has(type)
    ? nestedFile(type, slug, lang)
    : flatFile(type, slug, lang)

/**
 * Path to an assets directory for a content item.
 * @param type - Content type (blog, pages, positions)
 * @param slug - Content slug
 * @returns e.g. "blog/my-post/assets"
 */
export const assetDir = (type: string, slug: string): string =>
  join(root(), type, slug, 'assets')

/**
 * Path to a specific asset file.
 * @param type - Content type
 * @param slug - Content slug
 * @param filename - Asset filename
 * @returns e.g. "blog/my-post/assets/hero.svg"
 */
export const assetFile = (
  type: string,
  slug: string,
  filename: string
): string => join(root(), type, slug, 'assets', filename)

/**
 * Legacy alias for backward compatibility: blog directory path.
 * @param slug - Blog slug
 * @returns Path to the blog directory
 */
export const blogDir = (slug: string): string => nestedDir('blog', slug)

/**
 * Legacy alias for backward compatibility: blog file path.
 * @param slug - Blog slug
 * @param lang - Language code
 * @returns Path to the blog file
 */
export const blogFile = (slug: string, lang: string): string =>
  nestedFile('blog', slug, lang)

/**
 * Check if a path belongs to a content type.
 * @param path - File path to check
 * @param type - Content type
 * @returns True if path is under the type directory
 */
export const isTypePath = (path: string, type: string): boolean =>
  path.startsWith(`${typePath(type)}/`)
