import { readHistory } from '@/features/action-history/recorder'
import { renderHistoryJson } from '@/features/action-history/serialize'
import { uploadTextAttachment } from '../api/upload-history'
import type { TicketAttachment } from '../templates/attachment-types'

const HISTORY_FILE = 'actions-history.json'

/**
 * Snapshot the current action-history ring buffer and upload it as
 * a JSON attachment. Best-effort: if either step fails we log the
 * cause via the supplied callback and return undefined, so the
 * ticket can still go out without history.
 *
 * @param token - GitHub access token
 * @param onError - Reporter for non-fatal failures
 * @returns Attachment when upload succeeded
 */
export const attachActionHistory = async (
  token: string,
  onError: (msg: string) => void
): Promise<TicketAttachment | undefined> => {
  try {
    const entries = await readHistory()
    const text = renderHistoryJson(entries, Date.now())
    return await uploadTextAttachment({
      token,
      fileName: HISTORY_FILE,
      text,
    })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'history attach failed'
    onError(msg)
    return undefined
  }
}
