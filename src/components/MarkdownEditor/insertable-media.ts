import { buildMediaTag } from './build-media-tag'
import { requestImageAlt } from './request-alt'

const isImage = (mime: string): boolean => mime.startsWith('image/')

/**
 * Build the insertion tag for a media item, prompting the editor
 * for alt text when the file is an image. Returns undefined when
 * the editor cancels the alt-text prompt — the caller must skip
 * insertion in that case so empty-alt images never reach the
 * committed file.
 *
 * @param name - Asset filename
 * @param mime - MIME type string
 * @returns Tag to insert, or undefined when aborted
 */
export const buildInsertableMediaTag = (
  name: string,
  mime: string
): string | undefined => {
  const alt = isImage(mime) ? requestImageAlt() : undefined
  const aborted = isImage(mime) && alt === undefined
  return aborted ? undefined : buildMediaTag(name, mime, alt)
}
