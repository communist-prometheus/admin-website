import { buildInsertableMediaTag } from './insertable-media'

/** Minimal shape needed from a drag-like event. */
interface DropLike {
  readonly dataTransfer?: {
    readonly files: ArrayLike<File>
  } | null
}

/**
 * Extract the first media file from a drag event.
 * @param event - DragEvent or compatible object
 * @returns File if found, undefined otherwise
 */
export const extractDropFile = (event: DropLike): File | undefined =>
  event.dataTransfer?.files[0] ?? undefined

/**
 * Build an insertion tag for a dropped file. Returns undefined when
 * the user cancels the alt-text prompt for an image — caller must
 * skip insertion in that case.
 *
 * @param file - Dropped file
 * @returns Markdown/HTML tag string, or undefined
 */
export const buildDropTag = (file: File): string | undefined => {
  const tag = buildInsertableMediaTag(file.name, file.type)
  return tag === undefined ? undefined : `\n${tag}\n`
}
