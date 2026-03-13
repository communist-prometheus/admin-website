/**
 * Create a blob URL from base64 data and MIME type.
 * @param base64 - Base64-encoded content
 * @param mimeType - MIME type string
 * @returns Blob URL
 */
export const createBlobUrl = (base64: string, mimeType: string): string => {
  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i)
  }
  const blob = new Blob([bytes], { type: mimeType })
  return URL.createObjectURL(blob)
}

/**
 * Create a blob URL directly from a File or Blob.
 * @param file - File or Blob object
 * @returns Blob URL
 */
export const createBlobUrlFromFile = (file: Blob): string =>
  URL.createObjectURL(file)
