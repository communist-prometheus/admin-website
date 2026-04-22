/**
 * Insert imported markdown at the caret and return the images for
 * upload through the caller's existing asset pipeline.
 *
 * @param el target textarea element (may be undefined mid-transition)
 * @param markdown text to insert
 * @param images image files that accompany the markdown
 * @param upload callback invoked once per image
 */
export const insertImported = (
  el: HTMLTextAreaElement | undefined,
  markdown: string,
  images: readonly File[],
  upload: (file: File) => void
): void => {
  if (!el) return
  el.focus()
  document.execCommand('insertText', false, markdown)
  for (const file of images) upload(file)
}
