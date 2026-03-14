const LANG_SUFFIX = /\.(en|ru|it|es)\.md$/

/**
 * Extract slug from a content file path.
 * Blog uses index files: `blog/my-post/index.en.md` → `my-post`
 * Pages/positions are flat: `pages/manifest.en.md` → `manifest`
 * @param filepath - Repo-relative file path
 * @returns Slug string
 */
export const parseSlugFromPath = (filepath: string): string => {
  const parts = filepath.split('/')
  const filename = parts.pop() ?? ''
  const stripped = filename.replace(LANG_SUFFIX, '')
  return stripped === 'index' ? (parts.pop() ?? stripped) : stripped
}
