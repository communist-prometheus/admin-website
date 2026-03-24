import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useContentCreator } from '@/composables/useContent/useContentCreator'
import { useContentList } from '@/composables/useContent/useContentList'
import { useAuthStore } from '@/stores/auth'
import type { ContentType, Language } from '@/types/content'

const FIXED: ReadonlySet<ContentType> = new Set(['pages', 'common'])

/**
 * Setup core state for ContentView page.
 * @param contentType - The content type for this view
 * @returns Reactive state and list/creator composables
 */
export const useContentView = (contentType: ContentType) => {
  const router = useRouter()
  const authStore = useAuthStore()
  const isAuthenticated = computed(() => !!authStore.user)
  const isFixedStructure = computed(() => FIXED.has(contentType))
  const contentTypeRef = computed(() => contentType)
  const list = useContentList(contentTypeRef)
  const { createContent } = useContentCreator(() => contentType)
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
