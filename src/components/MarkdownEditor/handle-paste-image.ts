/**
 * Check if a MIME type is a supported media type.
 * @param type - MIME type string
 * @returns Whether it is image, video or audio
 */
const isMedia = (type: string): boolean =>
  type.startsWith('image/') ||
  type.startsWith('video/') ||
  type.startsWith('audio/')

/**
 * Extract a media file from a ClipboardEvent.
 * Returns the first image or video item or undefined.
 * @param event - Clipboard paste event
 * @returns Media File or undefined
 */
export const extractImageFile = (event: ClipboardEvent): File | undefined => {
  const items = event.clipboardData?.items
  if (!items) return undefined
  for (const item of items) {
    if (isMedia(item.type)) {
      return item.getAsFile() ?? undefined
    }
  }
  return undefined
}
