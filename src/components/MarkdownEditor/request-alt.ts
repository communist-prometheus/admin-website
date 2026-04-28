/**
 * Ask the editor for an alt text for the image they are about to
 * insert. Returns undefined when the user cancels or leaves the
 * prompt empty — callers MUST treat that as "abort the insertion"
 * so we never end up with empty-alt images on the public site.
 *
 * @returns Trimmed alt text, or undefined when the user backed out
 */
export const requestImageAlt = (): string | undefined => {
  const raw = globalThis.prompt(
    'Describe this image for screen readers (alt text). Required.'
  )
  const trimmed = raw?.trim() ?? ''
  return trimmed.length > 0 ? trimmed : undefined
}
