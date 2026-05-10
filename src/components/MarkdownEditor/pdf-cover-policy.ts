const AUTO_COVER_NAME = /^cover(\.[a-z]{2,3})?\.png$/i

const isAutoCoverPath = (path: string): boolean => {
  const filename = path.split('/').pop() ?? ''
  return AUTO_COVER_NAME.test(filename)
}

/**
 * Decide whether a freshly extracted PDF cover should overwrite the
 * frontmatter `image` field. We auto-set when there is no cover yet
 * AND when the current cover is itself an auto-extracted name
 * (`cover.png` or `cover.<lang>.png`) — re-uploading a PDF for a
 * language that inherited the legacy `cover.png` from a previous lang
 * must repoint to the new per-lang cover, otherwise the preview keeps
 * showing the old image. Only paths that look manually picked
 * (`hero.jpg`, `special-photo.png`, ...) are preserved.
 *
 * @param currentCover - frontmatter.image, or undefined when missing
 * @returns true when the new cover should be wired into frontmatter
 */
export const shouldAutoSetCover = (
  currentCover: string | undefined
): boolean =>
  currentCover === undefined ||
  currentCover === '' ||
  isAutoCoverPath(currentCover)
