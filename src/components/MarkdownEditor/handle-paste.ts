import { buildInsertableMediaTag } from './insertable-media'

/**
 * Check if a MIME type is a supported media type.
 * @param type - MIME type string
 * @returns Whether it is image, video or audio
 */
const isMedia = (type: string): boolean =>
  type.startsWith('image/') ||
  type.startsWith('video/') ||
  type.startsWith('audio/')

/** Minimal clipboard item shape. */
interface ClipboardItemLike {
  readonly type: string
  getAsFile(): File | null
}

/** Minimal shape needed from a paste-like event. */
interface PasteLike {
  readonly clipboardData?: {
    readonly items: ArrayLike<ClipboardItemLike>
  } | null
}

/**
 * Extract a media file from a ClipboardEvent.
 * Returns the first image, video or audio item.
 * @param event - ClipboardEvent or compatible object
 * @returns Media File or undefined
 */
export const extractMediaFile = (event: PasteLike): File | undefined => {
  const items = event.clipboardData?.items
  if (!items) return undefined
  for (const item of Array.from(items)) {
    if (isMedia(item.type)) {
      return item.getAsFile() ?? undefined
    }
  }
  return undefined
}

/**
 * Build an insertion tag for a pasted file. Returns undefined when
 * the user cancels the alt-text prompt for an image — caller must
 * skip insertion in that case.
 *
 * @param file - Pasted file
 * @returns Markdown/HTML tag string with newlines, or undefined
 */
export const buildPasteTag = (file: File): string | undefined => {
  const tag = buildInsertableMediaTag(file.name, file.type)
  return tag === undefined ? undefined : `\n${tag}\n`
}
