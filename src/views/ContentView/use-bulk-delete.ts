import type { Ref } from 'vue'
import type { ContentType } from '@/types/content'
import { runBulkDelete } from './bulk-delete-handler'
import { createBulkDeleteState } from './bulk-delete-state'

interface Deps {
  readonly contentType: Ref<ContentType>
  readonly reload: () => Promise<void>
  readonly pushAndTrack: (message: string) => Promise<string>
}

/**
 * Compose the bulk-delete state with a ready-to-fire delete handler.
 *
 * Pre-#201 the state existed but `ContentView.vue` never read or
 * mutated it — the Select button emitted enter-select into the void.
 * This helper bundles the state with a `runDelete` closure that
 * picks up the current selection so the view can stay declarative.
 *
 * @param deps - Reactive content type + reload + push+track
 * @returns State refs + a runDelete that exits select mode on success
 */
export const useBulkDelete = (deps: Deps) => {
  const state = createBulkDeleteState()
  const runDelete = async (): Promise<void> => {
    await runBulkDelete(
      {
        contentType: deps.contentType.value,
        pushAndTrack: deps.pushAndTrack,
        reload: deps.reload,
      },
      state.selectedSlugs.value
    )
    state.exit()
  }
  return { ...state, runDelete }
}
