/** Attachment kind — image renders inline, file renders as a link. */
export type AttachmentKind = 'image' | 'file'

/**
 * A ticket attachment that has already been uploaded to a stable URL.
 *
 * Returned by `upload-attachment.ts` and consumed by both the body
 * builder (renders the markdown link) and the form preview list.
 */
export interface TicketAttachment {
  readonly id: string
  readonly name: string
  readonly url: string
  readonly kind: AttachmentKind
  readonly sizeBytes: number
}
