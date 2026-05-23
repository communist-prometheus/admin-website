import { uploadAttachment } from '../api/upload-attachment'
import type { TicketAttachment } from '../templates/attachment-types'
import { partition } from './attachment-partition'

const fromList = (list: ArrayLike<File> | undefined): readonly File[] =>
  list === undefined ? [] : Array.from(list as ArrayLike<File>)

/**
 * Pull dropped File(s) out of a DragEvent.
 * @param event - DragEvent or compatible shape
 * @returns Files (empty when the drop carried only text)
 */
export const filesFromDrop = (event: DragEvent): readonly File[] =>
  fromList(event.dataTransfer?.files)

const itemAsFile = (item: DataTransferItem): File | undefined =>
  item.kind === 'file' ? (item.getAsFile() ?? undefined) : undefined

const isDefined = <T>(v: T | undefined): v is T => v !== undefined

/**
 * Pull image File(s) out of a paste ClipboardEvent.
 * @param event - ClipboardEvent or compatible shape
 * @returns Files (empty when the paste carried only text)
 */
export const filesFromPaste = (event: ClipboardEvent): readonly File[] => {
  const items = event.clipboardData?.items
  return items === undefined
    ? []
    : Array.from(items).map(itemAsFile).filter(isDefined)
}

interface UploadDeps {
  readonly token: string
  readonly files: readonly File[]
  readonly onError: (msg: string) => void
}

const failureMessages = (
  results: readonly PromiseSettledResult<TicketAttachment>[],
  files: readonly File[]
): readonly string[] =>
  results.flatMap((r, i) =>
    r.status === 'rejected'
      ? [`Upload failed for ${files[i]?.name}: ${r.reason}`]
      : []
  )

const reportFailures = (
  results: readonly PromiseSettledResult<TicketAttachment>[],
  files: readonly File[],
  onError: (msg: string) => void
): void => {
  for (const msg of failureMessages(results, files)) onError(msg)
}

/**
 * Upload a batch of files in parallel after filtering out the ones
 * that fail size or type validation. Rejection reasons and per-file
 * upload errors are both surfaced via `onError` so the user sees
 * exactly why something didn't land.
 *
 * @param deps - Token + files + error callback
 * @returns Successfully uploaded attachments
 */
export const uploadBatch = async (
  deps: UploadDeps
): Promise<readonly TicketAttachment[]> => {
  const { accepted, rejected } = partition(deps.files)
  for (const msg of rejected) deps.onError(msg)
  const results = await Promise.allSettled(
    accepted.map(file => uploadAttachment({ token: deps.token, file }))
  )
  reportFailures(results, accepted, deps.onError)
  return results.flatMap(r => (r.status === 'fulfilled' ? [r.value] : []))
}
