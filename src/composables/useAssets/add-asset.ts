import { createBlobUrl } from './create-blob-url'
import { dedupPending, scheduleReplace } from './dedup-pending'
import { fileToBase64 } from './file-to-base64'
import type { AssetState } from './state'
import type { PendingAsset } from './types'

/**
 * Create a function that adds a file as a pending asset.
 *
 * Replace semantics: adding a file whose name matches an existing
 * pending entry drops the old pending in favour of the new bytes
 * (and revokes the old blob URL). Adding a file whose name matches
 * an already-committed asset schedules the committed path for
 * deletion in the next transactional save, so save ends with one
 * file per name and no orphans accumulate.
 *
 * @param state - Reactive asset state
 * @returns Async function accepting a File, returns PendingAsset
 */
export const createAddAsset =
  (state: AssetState) =>
  async (file: File): Promise<PendingAsset> => {
    const base64 = await fileToBase64(file)
    const blobUrl = createBlobUrl(base64, file.type)
    const asset: PendingAsset = {
      name: file.name,
      base64,
      mimeType: file.type,
      blobUrl,
    }
    const cleanedAdds = dedupPending(state.pendingAdds.value, file.name)
    const sameCommitted = state.committed.value.find(
      c => c.name === file.name
    )
    state.pendingAdds.value = [...cleanedAdds, asset]
    state.pendingDeletes.value = scheduleReplace(
      state.pendingDeletes.value,
      sameCommitted?.path
    )
    return asset
  }
