import { computed, onMounted, watch } from 'vue'
import { useUnsavedGuard } from '@/composables/useUnsavedGuard'
import type { useEditPage } from './useEditPage'

type Page = ReturnType<typeof useEditPage>

/**
 * Wire up lifecycle hooks for the edit page.
 * @param page - Edit page state
 * @param initAll - Initialization function
 */
export const setupLifecycle = (page: Page, initAll: () => Promise<void>) => {
  const { editor, assets } = page
  const dirty = computed(() => editor.isDirty.value || assets.isDirty.value)
  useUnsavedGuard(dirty)
  onMounted(() => {
    if (page.isAuth.value) initAll()
  })
  watch(page.isAuth, auth => {
    if (auth) initAll()
  })
}
