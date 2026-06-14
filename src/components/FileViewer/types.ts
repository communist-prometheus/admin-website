/**
 * One file the viewer can page through. Display-only: the viewer never
 * fetches — the host supplies `url` (an image URL, or empty when the
 * type is not viewable, which triggers the pictogram + download panel).
 */
export interface ViewerFile {
  readonly name: string
  readonly mimeType: string
  /** Display URL for images; empty string when nothing to show. */
  readonly url: string
}
