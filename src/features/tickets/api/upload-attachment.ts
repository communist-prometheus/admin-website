import { fileToBase64 } from '@/composables/useAssets/file-to-base64'
import type { TicketAttachment } from '../templates/attachment-types'
import {
  buildAttachmentPath,
  detectKind,
  randomAttachmentId,
  TICKETS_BRANCH,
  TICKETS_REPO_NAME,
  TICKETS_REPO_OWNER,
} from './attachment-paths'
import { putContent } from './put-content'

const RAW = `https://raw.githubusercontent.com/${TICKETS_REPO_OWNER}/${TICKETS_REPO_NAME}/${TICKETS_BRANCH}`

interface UploadDeps {
  readonly token: string
  readonly file: File
}

/**
 * Upload one ticket attachment to the tickets repo.
 *
 * The file lands at `attachments/<id>/<sanitised-name>` on the tickets
 * repo's default branch and is referenced from the issue body via the
 * raw.githubusercontent.com URL — no extra hop, no third-party host.
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
  await putContent({
    token: deps.token,
    path,
    content,
    message: `Ticket attachment: ${deps.file.name}`,
  })
  return {
    id,
    name: deps.file.name,
    url: `${RAW}/${path}`,
    kind: detectKind(deps.file.type),
    sizeBytes: deps.file.size,
  }
}
