import { ref } from 'vue'
import type { Language } from '@/types/content'
import type { EditorDraft, MultiLangEditorState } from './types'

/**
 * Creates the initial reactive state for the multi-lang editor
 * @returns Editor state including caches and reactive refs
 */
export const createEditorState = () => {
  const cache = new Map<Language, EditorDraft>()
  const originalCache = new Map<Language, EditorDraft>()
  const fileSha = ref('')
  const saveVersion = ref(0)
  const state: MultiLangEditorState = {
    currentLang: ref<Language>('en'),
    frontmatterData: ref<Record<string, unknown>>({}),
    bodyContent: ref(''),
    loadingFile: ref(false),
    isDirty: undefined,
  }
  return { cache, originalCache, fileSha, saveVersion, state }
}

/**
 * Creates a reset function that clears all caches and state
 * @param cache - Draft cache map
 * @param originalCache - Original draft cache map
 * @param state - Editor state
 * @param fileSha - File SHA ref
 * @returns Function that resets all state
 */
export const createReset =
  (
    cache: Map<Language, EditorDraft>,
    originalCache: Map<Language, EditorDraft>,
    state: MultiLangEditorState,
    fileSha: ReturnType<typeof ref<string>>
  ) =>
  (): void => {
    cache.clear()
    originalCache.clear()
    state.currentLang.value = 'en'
    state.frontmatterData.value = {}
    state.bodyContent.value = ''
    fileSha.value = ''
  }
