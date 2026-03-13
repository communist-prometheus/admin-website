const MIME_MAP: Record<string, string> = {
  svg: 'image/svg+xml',
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  gif: 'image/gif',
  webp: 'image/webp',
  avif: 'image/avif',
  ico: 'image/x-icon',
  mp4: 'video/mp4',
  webm: 'video/webm',
  ogg: 'video/ogg',
  mov: 'video/quicktime',
}

const FALLBACK = 'application/octet-stream'

/**
 * Detect MIME type from a file path extension.
 * @param path - File path or name
 * @returns MIME type string
 */
export const detectMime = (path: string): string => {
  const ext = path.split('.').pop()?.toLowerCase() ?? ''
  return MIME_MAP[ext] ?? FALLBACK
}
