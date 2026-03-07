import type { Ref } from 'vue'
import type { Language } from '@/types/content'
import { snapshotAndSwitch, tryRestoreCached } from './switch-helpers'
import type { EditorDraft, MultiLangEditorState } from './types'

/**
 * Creates a function that switches language with cache
 * @param cache - Draft cache map
 * @param state - Editor state
 * @param fileSha - File SHA ref
 * @param loadFn - Function to load a file by path
 * @returns Async function to switch language
 */
export const createSwitchLanguage =
  (
    cache: Map<Language, EditorDraft>,
    state: MultiLangEditorState,
    fileSha: Ref<string>,
    loadFn: (path: string) => Promise<void>
  ) =>
  async (lang: Language, path?: string): Promise<void> => {
    snapshotAndSwitch(cache, state, fileSha, lang)
    if (tryRestoreCached(cache, lang, state, fileSha)) return
    if (path) {
      await loadFn(path)
      return
    }
    state.frontmatterData.value = {}
    state.bodyContent.value = ''
    fileSha.value = ''
  }
