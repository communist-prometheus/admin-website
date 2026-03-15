import type { ComputedRef } from 'vue'
import { useGitHubApi } from '../useGitHubApi'
import { createIsDirty } from './useMultiLangEditor/dirty-check'
import { createLoadLanguageVersion } from './useMultiLangEditor/load-language'
import { createMarkSaved } from './useMultiLangEditor/mark-saved'
import { createSaveCurrentLanguage } from './useMultiLangEditor/save-language'
import { createEditorState, createReset } from './useMultiLangEditor/state'
import { createSwitchLanguage } from './useMultiLangEditor/switch-language'

/**
 * Multi-language editor composable with per-language draft cache
 * @returns Multi-language editor interface
 */
export const useMultiLangEditor = () => {
  const { getFile, update } = useGitHubApi()
  const ctx = createEditorState()
  const { cache, originalCache, fileSha, saveVersion, state } = ctx

  const loadLang = createLoadLanguageVersion(
    getFile,
    cache,
    originalCache,
    state,
    fileSha
  )
  const isDirty = createIsDirty(
    cache,
    originalCache,
    state,
    fileSha,
    saveVersion
  )
  ;(state as { isDirty: ComputedRef<boolean> }).isDirty = isDirty

  return {
    ...state,
    isDirty,
    switchLanguage: createSwitchLanguage(cache, state, fileSha, loadLang),
    loadLanguageVersion: loadLang,
    saveCurrentLanguage: createSaveCurrentLanguage(
      update,
      cache,
      state,
      fileSha,
      originalCache,
      saveVersion
    ),
    markSaved: createMarkSaved(
      cache,
      originalCache,
      state,
      fileSha,
      saveVersion
    ),
    reset: createReset(cache, originalCache, state, fileSha),
  }
}
