import type { Ref } from 'vue'
import type { Language } from '@/types/content'
import type { EditorDraft, MultiLangEditorState } from './types'

const hasContent = (draft: EditorDraft): boolean =>
  draft.body !== '' || Object.keys(draft.frontmatter).length > 0

const differsFrom = (draft: EditorDraft, original: EditorDraft): boolean =>
  draft.body !== original.body ||
  JSON.stringify(draft.frontmatter) !== JSON.stringify(original.frontmatter)

const isDraftModified = (
  draft: EditorDraft,
  original: EditorDraft | undefined
): boolean =>
  original === undefined ? hasContent(draft) : differsFrom(draft, original)

const liveDraft = (
  state: MultiLangEditorState,
  fileSha: Ref<string>
): EditorDraft => ({
  frontmatter: state.frontmatterData.value,
  body: state.bodyContent.value,
  sha: fileSha.value,
  loaded: true,
})

const otherLangsDirty = (
  cache: Map<Language, EditorDraft>,
  originalCache: Map<Language, EditorDraft>,
  currentLang: Language
): boolean =>
  [...cache].some(
    ([lang, draft]) =>
      lang !== currentLang && isDraftModified(draft, originalCache.get(lang))
  )

/**
 * Pure dirty check across the live editor state and any other-lang
 * cached drafts. No side effects — extracted from the previous
 * `createIsDirty` body so the computed wrapper stays a one-liner.
 * @param cache - Per-lang draft cache
 * @param originalCache - Per-lang baseline for diffing
 * @param state - Editor state refs
 * @param fileSha - File SHA ref for the current lang
 * @returns Whether anything in cache + live state differs from baseline
 */
export const computeDirty = (
  cache: Map<Language, EditorDraft>,
  originalCache: Map<Language, EditorDraft>,
  state: MultiLangEditorState,
  fileSha: Ref<string>
): boolean => {
  const currentLang = state.currentLang.value
  const live = liveDraft(state, fileSha)
  return (
    isDraftModified(live, originalCache.get(currentLang)) ||
    otherLangsDirty(cache, originalCache, currentLang)
  )
}
