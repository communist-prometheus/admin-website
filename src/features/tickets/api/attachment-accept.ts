import { ALLOWED_EXTENSIONS, ALLOWED_MIME_TYPES } from './attachment-limits'

/**
 * Value for the file-picker `accept` attribute, combining the
 * image+text globs with the explicit MIME and extension allow-list.
 * Browsers fuzzy-match on either MIME or extension, so listing both
 * gives the best chance of the picker showing the right files.
 */
export const ACCEPT_ATTR: string = [
  'image/*',
  'text/*',
  ...ALLOWED_MIME_TYPES,
  ...ALLOWED_EXTENSIONS,
].join(',')
