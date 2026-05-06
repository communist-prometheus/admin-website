import type { AttachmentKind } from '../templates/attachment-types'

/** Owner of the tickets repository — kept central so all callers agree. */
export const TICKETS_REPO_OWNER = 'communist-prometheus'

/** Tickets repository name. */
export const TICKETS_REPO_NAME = 'tickets'

/** Default branch for ticket attachments. */
export const TICKETS_BRANCH = 'master'

const sanitize = (name: string): string =>
  name
    .replace(/[^\w.\- ]+/g, '_')
    .replace(/\s+/g, '-')
    .toLowerCase()

/**
 * Generate a short random id for a per-attachment folder.
 * @returns 12-char hex id
 */
export const randomAttachmentId = (): string =>
  globalThis.crypto.randomUUID().replace(/-/g, '').slice(0, 12)

/**
 * Build the repo-relative path for a single attachment.
 * @param fileName - Original file name
 * @param id - Random per-attachment folder id
 * @returns Path under the tickets repo, e.g. `attachments/abc/foo.png`
 */
export const buildAttachmentPath = (fileName: string, id: string): string =>
  `attachments/${id}/${sanitize(fileName)}`

/**
 * Map a MIME type to the attachment kind used by the body builder.
 * @param mime - MIME content type (may be empty)
 * @returns 'image' or 'file'
 */
export const detectKind = (mime: string): AttachmentKind =>
  mime.startsWith('image/') ? 'image' : 'file'
