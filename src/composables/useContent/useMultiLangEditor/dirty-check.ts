import type { ComputedRef, Ref } from 'vue'
import { computed } from 'vue'
import type { Language } from '@/types/content'
import { snapshotDraft } from './draft-cache'
import type { EditorDraft, MultiLangEditorState } from './types'

const isDraftModified = (
  draft: EditorDraft,
  original: EditorDraft | undefined
): boolean => {
  if (!original) {
    return draft.body !== '' || Object.keys(draft.frontmatter).length > 0
  }
  return (
    draft.body !== original.body ||
    JSON.stringify(draft.frontmatter) !== JSON.stringify(original.frontmatter)
  )
}

/**
 * Creates a computed dirty flag across all language drafts
 * @param cache - Current draft cache
 * @param originalCache - Original (saved) draft cache
 * @param state - Editor state
 * @param fileSha - Current file SHA ref
 * @returns Computed boolean indicating unsaved changes
 */
export const createIsDirty = (
  cache: Map<Language, EditorDraft>,
  originalCache: Map<Language, EditorDraft>,
  state: MultiLangEditorState,
  fileSha: Ref<string>,
  saveVersion: Ref<number>
): ComputedRef<boolean> =>
  computed(() => {
    void saveVersion.value
    snapshotDraft(
      cache,
      state.currentLang.value,
      state.frontmatterData.value,
      state.bodyContent.value,
      fileSha.value
    )
    for (const [lang, draft] of cache) {
      if (isDraftModified(draft, originalCache.get(lang))) return true
    }
    return false
  })
