import { buildInsertableMediaTag } from './insertable-media'
import { execMedia } from './use-commands'

/**
 * Insert a media tag for an uploaded file into the textarea. Skips
 * insertion when the editor cancels the alt-text prompt for an
 * image — empty-alt images must never reach the file.
 *
 * @param el - Textarea element
 * @param file - Uploaded file
 */
export const insertUploadTag = (
  el: HTMLTextAreaElement,
  file: File
): void => {
  const tag = buildInsertableMediaTag(file.name, file.type)
  const list = tag === undefined ? [] : [tag]
  for (const t of list) execMedia(el, t)
}
