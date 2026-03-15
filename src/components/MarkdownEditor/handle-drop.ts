import { buildMediaTag } from './build-media-tag'

/**
 * Extract the first media file from a drag event.
 * @param event - DragEvent from drop handler
 * @returns File if found, undefined otherwise
 */
export const extractDropFile = (event: DragEvent): File | undefined =>
  event.dataTransfer?.files[0] ?? undefined

/**
 * Build an insertion tag for a dropped file.
 * @param file - Dropped file
 * @returns Markdown/HTML tag string
 */
export const buildDropTag = (file: File): string =>
  `\n${buildMediaTag(file.name, file.type)}\n`
