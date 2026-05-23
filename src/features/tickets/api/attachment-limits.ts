/** Hard upper bound for one ticket attachment (100 MiB, GitHub blob cap). */
export const MAX_ATTACHMENT_BYTES = 100 * 1024 * 1024

/**
 * Files at or below this size go through the Contents API
 * (single PUT). Larger files must go through the Git Data API
 * because the Contents endpoint becomes unreliable past ~1 MiB.
 */
export const CONTENTS_API_THRESHOLD_BYTES = 1024 * 1024

/**
 * Allowed extensions (lower-case, with leading dot). Some browsers
 * leave `file.type` empty for archives and office formats, so we
 * also match by extension to keep drag-and-drop reliable.
 */
export const ALLOWED_EXTENSIONS: readonly string[] = [
  '.pdf',
  '.doc',
  '.docx',
  '.xls',
  '.xlsx',
  '.zip',
  '.tar',
  '.gz',
  '.tgz',
  '.7z',
  '.rar',
  '.txt',
  '.csv',
  '.log',
  '.json',
]

/**
 * MIME types accepted in addition to the `image/*` and `text/*`
 * globs. Listed explicitly so the file-picker `accept` attribute
 * and the runtime validator agree on the same set.
 */
export const ALLOWED_MIME_TYPES: readonly string[] = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/zip',
  'application/x-zip-compressed',
  'application/x-tar',
  'application/gzip',
  'application/x-gzip',
  'application/x-7z-compressed',
  'application/x-rar-compressed',
  'application/vnd.rar',
  'application/json',
]
