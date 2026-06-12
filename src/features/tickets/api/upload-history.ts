import type { TicketAttachment } from '../templates/attachment-types'
import {
  buildAttachmentPath,
  buildAttachmentUrl,
  randomAttachmentId,
} from './attachment-paths'
import { putContent } from './put-content'

const toBase64 = (text: string): string =>
  globalThis.btoa(unescape(encodeURIComponent(text)))

interface UploadDeps {
  readonly token: string
  readonly fileName: string
  readonly text: string
}

/**
 * Upload a text file (JSON, plain) to the tickets repo as an
 * attachment so it can be linked from the issue body alongside
 * the user's photos.
 *
 * @param deps - Token + name + raw text content
 * @returns Resolved attachment with stable URL
 */
export const uploadTextAttachment = async (
  deps: UploadDeps
): Promise<TicketAttachment> => {
  const id = randomAttachmentId()
  const path = buildAttachmentPath(deps.fileName, id)
  await putContent({
    token: deps.token,
    path,
    content: toBase64(deps.text),
    message: `Ticket attachment: ${deps.fileName}`,
  })
  return {
    id,
    name: deps.fileName,
    url: buildAttachmentUrl(path),
    kind: 'file',
    sizeBytes: deps.text.length,
  }
}
