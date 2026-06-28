import { fileToBase64 } from '@/composables/useAssets/file-to-base64'
import type { TicketAttachment } from '../templates/attachment-types'
import {
  buildAttachmentPath,
  buildAttachmentUrl,
  detectKind,
  randomAttachmentId,
} from './attachment-paths'
import { proxyAttach } from './proxy-attach'

interface UploadDeps {
  readonly token: string
  readonly file: File
}

/**
 * Upload one ticket attachment to the tickets repo.
 *
 * The file lands at `attachments/<id>/<sanitised-name>` on the tickets
 * repo's default branch and is referenced from the issue body via its
 * github.com blob URL — member-only access, no third-party host.
 *
 * @param deps - Token + File pair
 * @returns Resolved attachment with stable URL
 */
export const uploadAttachment = async (
  deps: UploadDeps
): Promise<TicketAttachment> => {
  const id = randomAttachmentId()
  const path = buildAttachmentPath(deps.file.name, id)
  const content = await fileToBase64(deps.file)
  const message = `Ticket attachment: ${deps.file.name}`
  // Write through the same-origin proxy (service token), so the editor
  // needs no direct access to the private tickets repo.
  await proxyAttach({ token: deps.token, path, content, message })
  return {
    id,
    name: deps.file.name,
    url: buildAttachmentUrl(path),
    kind: detectKind(deps.file.type),
    sizeBytes: deps.file.size,
  }
}
