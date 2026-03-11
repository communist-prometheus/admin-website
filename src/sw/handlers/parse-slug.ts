const LANG_SUFFIX = /\.(en|ru|it|es)\.md$/

/**
 * Extract slug from a content filename.
 * E.g. "welcome-to-prometheus.en.md" → "welcome-to-prometheus"
 * @param filename - File name with lang and .md extension
 * @returns Slug string
 */
export const parseSlug = (filename: string): string =>
  filename.replace(LANG_SUFFIX, '')

/**
 * Extract the filename from a full path.
 * @param filepath - Full file path
 * @returns Last segment of the path
 */
export const basename = (filepath: string): string =>
  filepath.split('/').pop() ?? filepath
