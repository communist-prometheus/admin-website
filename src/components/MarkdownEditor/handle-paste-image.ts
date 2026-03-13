/**
 * Extract an image file from a ClipboardEvent.
 * Returns the first image item or undefined.
 * @param event - Clipboard paste event
 * @returns Image File or undefined
 */
export const extractImageFile = (event: ClipboardEvent): File | undefined => {
  const items = event.clipboardData?.items
  if (!items) return undefined
  for (const item of items) {
    if (item.type.startsWith('image/')) {
      return item.getAsFile() ?? undefined
    }
  }
  return undefined
}
