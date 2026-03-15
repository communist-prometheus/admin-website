import { buildMediaTag } from './build-media-tag'
import { execMedia } from './use-commands'

/**
 * Insert a media tag for an uploaded file into the textarea.
 * @param el - Textarea element
 * @param file - Uploaded file
 */
export const insertUploadTag = (
  el: HTMLTextAreaElement,
  file: File
): void => {
  execMedia(el, buildMediaTag(file.name, file.type))
}
