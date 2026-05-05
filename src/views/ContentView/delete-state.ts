import { computed, type Ref, ref } from 'vue'
import type { ContentItem, ContentType, Language } from '@/types/content'
import { buildDeleteHandlers } from './build-delete-handlers'
import type { createDeleteHandlers } from './create-delete-handlers'
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

interface CreateArgs {
  readonly contentType: Ref<ContentType>
  readonly selectedLang: Ref<Language>
  readonly listItems: Ref<readonly ContentItem[]>
  readonly reload: () => Promise<void>
  readonly pushAndTrack: (message: string) => Promise<string>
}

/**
 * Create delete-related state and handlers.
 *
 * @param args - Reactive deps and callbacks
 * @returns Delete state + handlers + a reactive set of slugs that
 * are currently animating their delete.
 */
export const createDeleteState = (args: CreateArgs) => {
  const deleteTarget = ref<ContentItem | undefined>()
  const deleting = createDeletingState()
  const clear = (): void => {
    deleteTarget.value = undefined
  }
  const raw = buildDeleteHandlers(args)
  return {
    deleteTarget,
    showDeleteDialog: computed(() => deleteTarget.value !== undefined),
    deletingSlugs: deleting.slugs,
    ...buildOptimistic(deleteTarget, deleting, clear, raw),
  }
}
