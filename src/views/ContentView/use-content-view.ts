import type { Ref } from 'vue'
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useContentCreator } from '@/composables/useContent/useContentCreator'
import { useContentList } from '@/composables/useContent/useContentList'
import { useAuthStore } from '@/stores/auth'
import type { ContentType, Language } from '@/types/content'

const FIXED: ReadonlySet<ContentType> = new Set(['pages', 'common'])

/**
 * Setup core state for ContentView page.
 * @param contentType - Reactive content type ref
 * @returns Reactive state and list/creator composables
 */
export const useContentView = (contentType: Ref<ContentType>) => {
  const router = useRouter()
  const authStore = useAuthStore()
  const isAuthenticated = computed(() => !!authStore.user)
  const isFixedStructure = computed(() => FIXED.has(contentType.value))
  const list = useContentList(contentType)
  const { createContent } = useContentCreator(() => contentType.value)
  const error = ref<string | null>(null)
  const selectedLang = ref<Language>('en')
  const showCreateDialog = ref(false)

  return {
    router,
    isAuthenticated,
    isFixedStructure,
    ...list,
    createContent,
    error,
    selectedLang,
    showCreateDialog,
  }
}
