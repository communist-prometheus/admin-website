import { computed, type Ref, ref } from 'vue'
import type { ContentItem, ContentType, Language } from '@/types/content'
import { createDeleteHandlers } from './create-delete-handlers'
import { createDeletingState, type DeletingState } from './deleting-state'
import { runOptimisticDelete } from './run-optimistic-delete'

const buildOptimistic = (
  target: Ref<ContentItem | undefined>,
  deleting: DeletingState,
  clear: () => void,
  raw: ReturnType<typeof createDeleteHandlers>
) => ({
  handleDeleteAll: () =>
    runOptimisticDelete({ target, deleting, clear }, raw.deleteAll),
  handleDeleteLang: () =>
    runOptimisticDelete({ target, deleting, clear }, raw.deleteLang),
})

/**
 * Create delete-related state and handlers.
 * @param contentType - Content type
 * @param selectedLang - Current selected language
 * @param reload - Reload callback
 * @param pushAndTrack - Unified push+track function
 * @returns Delete state + handlers + a reactive set of slugs that
 * are currently animating their delete (drives the fade CSS on
 * ContentListItem).
 */
export const createDeleteState = (
  contentType: Ref<ContentType>,
  selectedLang: Ref<Language>,
  reload: () => Promise<void>,
  pushAndTrack: (message: string) => Promise<string>
) => {
  const deleteTarget = ref<ContentItem | undefined>()
  const deleting = createDeletingState()
  const clear = (): void => {
    deleteTarget.value = undefined
  }
  const raw = createDeleteHandlers({
    contentType: contentType.value,
    selectedLang: selectedLang.value,
    reload,
    clearTarget: () => undefined,
    pushAndTrack,
  })
  return {
    deleteTarget,
    showDeleteDialog: computed(() => deleteTarget.value !== undefined),
    deletingSlugs: deleting.slugs,
    ...buildOptimistic(deleteTarget, deleting, clear, raw),
  }
}
