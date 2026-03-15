import type { Ref } from 'vue'
import type { Language } from '@/types/content'
import type { EditorDraft, MultiLangEditorState } from './types'

/**
 * Creates a function that marks the current language as saved.
 * Updates both draft and original caches so isDirty becomes false.
 * @param cache - Draft cache map
 * @param originalCache - Original draft cache
 * @param state - Editor state
 * @param fileSha - File SHA ref
 * @returns Function that marks current language clean
 */
export const createMarkSaved =
  (
    cache: Map<Language, EditorDraft>,
    originalCache: Map<Language, EditorDraft>,
    state: MultiLangEditorState,
    fileSha: Ref<string>,
    saveVersion: Ref<number>
  ): (() => void) =>
  (): void => {
    const draft: EditorDraft = {
      frontmatter: { ...state.frontmatterData.value },
      body: state.bodyContent.value,
      sha: fileSha.value,
      loaded: true,
    }
    const lang = state.currentLang.value
    cache.set(lang, draft)
    originalCache.set(lang, { ...draft })
    saveVersion.value += 1
  }
