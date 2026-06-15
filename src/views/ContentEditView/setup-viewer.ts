import { useFileViewer } from '@/composables/useFileViewer/useFileViewer'
import type { useEditPage } from './useEditPage'

/**
 * Wire the file viewer to the edit page's assets: page over the live
 * asset list and route downloads back through the asset handlers.
 * @param p - The edit-page state bundle.
 * @returns The file-viewer reactive state + actions.
 */
export const setupViewer = (p: ReturnType<typeof useEditPage>) =>
  useFileViewer(
    () => (p.hasAssets.value ? p.assets.allAssets.value : []),
    asset => {
      void p.ah.onDownloadAsset(asset)
    }
  )
