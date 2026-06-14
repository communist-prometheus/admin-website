import { computed, ref } from 'vue'
import type { ViewerFile } from '@/components/FileViewer/types'
import {
  assetToDownloadable,
  type DownloadableAsset,
} from '@/composables/useAssets/download-asset'
import type { AssetDisplay } from '@/composables/useAssets/types'

/**
 * Drive the file viewer over a live list of display assets: open at an
 * index, page through, and download the current file. The viewer
 * component itself stays display-only; this glue maps assets to
 * {@link ViewerFile} and routes downloads back to the asset layer.
 * @param assets - Accessor for the current display assets
 * @param download - Sink that performs the actual download
 * @returns Reactive viewer state + actions
 */
export const useFileViewer = (
  assets: () => readonly AssetDisplay[],
  download: (asset: DownloadableAsset) => void
) => {
  const open = ref(false)
  const index = ref(0)

  const files = computed<readonly ViewerFile[]>(() =>
    assets().map(a => ({
      name: a.name,
      mimeType: a.mimeType,
      url: a.thumbnailUrl,
    }))
  )

  const openAt = (at: number): void => {
    index.value = at
    open.value = true
  }

  const close = (): void => {
    open.value = false
  }

  const setIndex = (at: number): void => {
    index.value = at
  }

  const downloadAt = (at: number): void => {
    const asset = assets()[at]
    if (asset) download(assetToDownloadable(asset))
  }

  return { open, index, files, openAt, close, setIndex, downloadAt }
}
