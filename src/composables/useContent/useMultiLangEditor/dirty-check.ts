import type { ComputedRef, Ref } from 'vue'
import { computed } from 'vue'
import type { Language } from '@/types/content'
import { computeDirty } from './dirty-helpers'
import type { EditorDraft, MultiLangEditorState } from './types'

/**
 * Computed dirty flag across all language drafts.
 *
 * The previous implementation called `snapshotDraft` here as a side
 * effect to "freshen" the cache before iterating — that wrote
 * `loaded: true` empty entries during init (currentLang briefly =
 * 'en', frontmatter briefly = {}), and `tryRestoreCached('en')`
 * later treated them as real loaded files, wiping the editor on
 * lang switch (the 2026-05-10 magazine regression). A computed
 * must not mutate.
 * @param cache - Per-lang draft cache
 * @param originalCache - Per-lang baseline for diffing
 * @param state - Editor state refs
 * @param fileSha - File SHA ref for the current lang
 * @param saveVersion - Reactive counter that re-triggers the compute
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
    return computeDirty(cache, originalCache, state, fileSha)
  })
