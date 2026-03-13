import { type Ref, ref } from 'vue'
import type { AssetItem } from '../useGitHubApi/asset-types'
import type { PendingAsset } from './types'

/** Reactive state for the asset manager */
export interface AssetState {
  readonly committed: Ref<readonly AssetItem[]>
  readonly pendingAdds: Ref<readonly PendingAsset[]>
  readonly pendingDeletes: Ref<ReadonlySet<string>>
  readonly coverPath: Ref<string | undefined>
  readonly resolvedUrls: Ref<ReadonlyMap<string, string>>
  readonly loading: Ref<boolean>
}

/**
 * Create initial reactive asset state.
 * @param initialCover - Initial cover path from frontmatter
 * @returns Reactive state object
 */
export const createAssetState = (
  initialCover: string | undefined
): AssetState => ({
  committed: ref([]),
  pendingAdds: ref([]),
  pendingDeletes: ref(new Set<string>()),
  coverPath: ref(initialCover),
  resolvedUrls: ref(new Map<string, string>()),
  loading: ref(false),
})
