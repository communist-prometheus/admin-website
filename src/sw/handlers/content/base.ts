import { workerState } from '../../state/state'

/** Content types that use nested folder layout. */
export const NESTED_TYPES = new Set([
  'blog',
  'positions',
  'pages',
  'common',
  'newspaper',
])

/**
 * Check whether a content type uses nested layout.
 * @param type - Content type
 * @returns Whether the type is nested
 */
export const isNested = (type: string): boolean => NESTED_TYPES.has(type)

/**
 * Get content base path for a type.
 * @param type - Content type (blog, pages, positions)
 * @returns Path prefix for file listing
 */
export const contentBase = (type: string): string => {
  const cp = workerState.config?.contentPath ?? ''
  return cp ? `${cp}/${type}` : type
}

/**
 * Build a new file path for a content item.
 * @param type - Content type
 * @param slug - Content slug
 * @param lang - Language code
 * @returns New file path string
 */
export const newFilePath = (
  type: string,
  slug: string,
  lang: string
): string =>
  isNested(type)
    ? `${contentBase(type)}/${slug}/index.${lang}.md`
    : `${contentBase(type)}/${slug}.${lang}.md`
