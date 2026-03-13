import type { useAssets } from '@/composables/useAssets/useAssets'
import { createUploadHandlers } from './asset-upload-handlers'

type Assets = ReturnType<typeof useAssets>

/**
 * Create event handlers for asset management UI.
 * @param assets - Asset manager instance
 * @returns Object with all asset event handlers
 */
export const createAssetHandlers = (assets: Assets) => ({
  ...createUploadHandlers(assets),

  /** Handle cover removal */
  onRemoveCover: (): void => {
    assets.removeCover()
  },

  /**
   * Handle asset deletion — also removes cover.
   * @param path - Asset path to delete
   */
  onDeleteAsset: (path: string): void => {
    const name = path.split('/').pop() ?? ''
    if (assets.coverPath.value === `./assets/${name}`) {
      assets.removeCover()
    }
    assets.removeAsset(path)
  },

  /**
   * Handle set-as-cover from panel.
   * @param name - Asset filename
   */
  onSetCover: (name: string): void => {
    assets.setCover(name)
  },
})
