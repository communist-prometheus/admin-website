import {
  ALLOWED_EXTENSIONS,
  ALLOWED_MIME_TYPES,
  MAX_ATTACHMENT_BYTES,
} from './attachment-limits'

/** Result of validating a candidate attachment File. */
export type ValidationResult =
  | { readonly ok: true }
  | { readonly ok: false; readonly reason: string }

const MIB = 1024 * 1024

const isAllowedMime = (type: string): boolean =>
  type.startsWith('image/') ||
  type.startsWith('text/') ||
  ALLOWED_MIME_TYPES.includes(type)

const isAllowedExt = (name: string): boolean => {
  const lower = name.toLowerCase()
  return ALLOWED_EXTENSIONS.some(ext => lower.endsWith(ext))
}

const formatMiB = (bytes: number): string => `${(bytes / MIB).toFixed(1)} MiB`

const tooLarge = (file: File): ValidationResult | undefined =>
  file.size > MAX_ATTACHMENT_BYTES
    ? {
        ok: false,
        reason: `${file.name} is ${formatMiB(file.size)} — limit is ${formatMiB(MAX_ATTACHMENT_BYTES)}`,
      }
    : undefined

const badType = (file: File): ValidationResult | undefined =>
  isAllowedMime(file.type) || isAllowedExt(file.name)
    ? undefined
    : { ok: false, reason: `${file.name} is not an allowed file type` }

/**
 * Validate a candidate attachment against the size cap and the
 * MIME / extension allow-list. Returns a tagged result so callers
 * can surface the exact rejection reason to the user.
 * @param file - The candidate File from picker / drop / paste.
 * @returns ok or a tagged failure with a human-readable reason.
 */
export const validateAttachment = (file: File): ValidationResult =>
  tooLarge(file) ?? badType(file) ?? { ok: true }
