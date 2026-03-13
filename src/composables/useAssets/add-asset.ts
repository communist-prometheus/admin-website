import { createBlobUrl } from './create-blob-url'
import { fileToBase64 } from './file-to-base64'
import type { AssetState } from './state'
import type { PendingAsset } from './types'

/**
 * Create a function that adds a file as a pending asset.
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
    state.pendingAdds.value = [...state.pendingAdds.value, asset]
    return asset
  }
