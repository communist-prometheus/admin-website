/**
 * Decide whether a freshly extracted PDF cover should overwrite the
 * frontmatter image. We only auto-set when the entry has no cover
 * picked yet — once an editor has chosen a custom image we must not
 * silently replace it on the next PDF upload.
 *
 * @param currentCover - frontmatter.image, or undefined when missing
 * @returns true when the new cover should also be wired into frontmatter
 */
export const shouldAutoSetCover = (
  currentCover: string | undefined
): boolean => currentCover === undefined || currentCover === ''
