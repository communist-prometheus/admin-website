import type { useAssets } from '@/composables/useAssets/useAssets'

type Assets = ReturnType<typeof useAssets>

/**
 * Create upload-related asset handlers.
 * @param assets - Asset manager instance
 * @returns Paste, upload, and cover upload handlers
 */
export const createUploadHandlers = (assets: Assets) => ({
  /**
   * Handle image paste from editor.
   * @param file - Pasted image file
   */
  onPasteImage: async (file: File): Promise<void> => {
    await assets.addAsset(file)
  },

  /**
   * Handle asset upload from panel.
   * @param file - Uploaded file
   */
  onUploadAsset: async (file: File): Promise<void> => {
    await assets.addAsset(file)
  },

  /**
   * Handle cover upload — adds asset and sets as cover.
   * @param file - Uploaded cover file
   */
  onUploadCover: async (file: File): Promise<void> => {
    const asset = await assets.addAsset(file)
    assets.setCover(asset.name)
  },
})
