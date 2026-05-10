import { computed, onMounted, watch } from 'vue'
import { useUnsavedGuard } from '@/composables/useUnsavedGuard'
import type { useEditPage } from './useEditPage'

type Page = ReturnType<typeof useEditPage>

/**
 * Wire up lifecycle hooks for the edit page.
 * `assets.coverPath` follows `editor.frontmatterData.image` so that
 * switching language re-points the cover preview at the active lang's
 * image (per-lang covers, see `langScopedByType`). Without this watch,
 * `coverPath` only got seeded once on initial load and stayed pinned.
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
  watch(
    () => editor.frontmatterData.value.image,
    img => {
      assets.coverPath.value = typeof img === 'string' ? img : undefined
    }
  )
}
