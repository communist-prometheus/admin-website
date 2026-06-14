/**
 * Available content types
 */
export type ContentType =
  | 'blog'
  | 'positions'
  | 'pages'
  | 'common'
  | 'newspaper'
  | 'archive'

/** All valid content type values */
const CONTENT_TYPE_VALUES: readonly string[] = [
  'blog',
  'positions',
  'pages',
  'common',
  'newspaper',
  'archive',
]

/**
 * Type guard to narrow a string to ContentType.
 * @param value - String to check
 * @returns True if the value is a valid ContentType
 */
export const isContentType = (value: string): value is ContentType =>
  CONTENT_TYPE_VALUES.includes(value)

/**
 * Content types that use folder-based structure
 * (slug/index.\{lang\}.md)
 */
export const NESTED_TYPES: ReadonlySet<ContentType> = new Set([
  'blog',
  'positions',
  'pages',
  'common',
  'newspaper',
  'archive',
])
