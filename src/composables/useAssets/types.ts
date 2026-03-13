import type { Ref } from 'vue'
import type { AssetItem } from '../useGitHubApi/asset-types'

/** A locally-added asset not yet committed */
export interface PendingAsset {
  readonly name: string
  readonly base64: string
  readonly mimeType: string
  readonly blobUrl: string
}

/** Display-ready asset merging committed and pending state */
export interface AssetDisplay {
  readonly name: string
  readonly path: string
  readonly mimeType: string
  readonly thumbnailUrl: string
  readonly status: 'committed' | 'pending-add' | 'pending-delete'
  readonly isCover: boolean
}

/** Full asset manager state */
export interface AssetManagerState {
  readonly committed: Ref<readonly AssetItem[]>
  readonly pendingAdds: Ref<readonly PendingAsset[]>
  readonly pendingDeletes: Ref<ReadonlySet<string>>
  readonly coverImage: Ref<string | undefined>
  readonly loading: Ref<boolean>
}
