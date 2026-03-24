import type { Ref } from 'vue'
import { computed, ref } from 'vue'
import type { ContentItem, ContentType, Language } from '@/types/content'
import { createDeleteHandlers } from './create-delete-handlers'

/**
 * Build handlers from target ref and delete ops.
 * @param target - Reactive delete target ref
 * @param h - Delete handler operations
 * @returns Delete all and delete lang handlers
 */
const buildHandlers = (
  target: Ref<ContentItem | undefined>,
  h: ReturnType<typeof createDeleteHandlers>
) => ({
  handleDeleteAll: () => {
    if (target.value) h.deleteAll(target.value)
  },
  handleDeleteLang: () => {
    if (target.value) h.deleteLang(target.value)
  },
})

/**
 * Create delete-related state and handlers.
 * @param contentType - Content type
 * @param selectedLang - Current selected language
 * @param reload - Reload callback
 * @returns Delete state and handlers
 */
export const createDeleteState = (
  contentType: ContentType,
  selectedLang: Ref<Language>,
  reload: () => Promise<void>
) => {
  const deleteTarget = ref<ContentItem | undefined>()
  const showDeleteDialog = computed(() => deleteTarget.value !== undefined)
  const clear = () => {
    deleteTarget.value = undefined
  }
  const h = createDeleteHandlers({
    contentType,
    selectedLang: selectedLang.value,
    reload,
    clearTarget: clear,
  })
  return {
    deleteTarget,
    showDeleteDialog,
    ...buildHandlers(deleteTarget, h),
  }
}
