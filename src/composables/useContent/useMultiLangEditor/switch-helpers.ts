import type { Ref } from 'vue'
import type { Language } from '@/types/content'
import { restoreFromCache, snapshotDraft } from './draft-cache'
import type { EditorDraft, MultiLangEditorState } from './types'

/**
 * Snapshots current draft and sets new language
 * @param cache - Draft cache map
 * @param state - Editor state
 * @param fileSha - File SHA ref
 * @param lang - Target language
 */
export const snapshotAndSwitch = (
  cache: Map<Language, EditorDraft>,
  state: MultiLangEditorState,
  fileSha: Ref<string>,
  lang: Language
): void => {
  snapshotDraft(
    cache,
    state.currentLang.value,
    state.frontmatterData.value,
    state.bodyContent.value,
    fileSha.value
  )
  state.currentLang.value = lang
}

/**
 * Tries to restore a cached draft, returns success
 * @param cache - Draft cache map
 * @param lang - Language to restore
 * @param state - Editor state
 * @param fileSha - File SHA ref
 * @returns Whether a cached draft was restored
 */
export const tryRestoreCached = (
  cache: Map<Language, EditorDraft>,
  lang: Language,
  state: MultiLangEditorState,
  fileSha: Ref<string>
): boolean => {
  const cached = cache.get(lang)
  if (!cached?.loaded) return false
  restoreFromCache(cached, state)
  fileSha.value = cached.sha
  return true
}
