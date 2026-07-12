import type { Ref } from 'vue'
import type { Language } from '@/types/content'
import type { EditorDraft, MultiLangEditorState } from './types'

const dropFields = (
  src: Record<string, unknown>,
  fields: readonly string[]
): Record<string, unknown> => {
  const out: Record<string, unknown> = { ...src }
  for (const k of fields) delete out[k]
  return out
}

/**
 * Seed a fresh draft for a brand-new lang. Frontmatter is mostly
 * entity-level (every translation shares title/category/etc.); the
 * exceptions live in `langScopedFields`. Magazine passes
 * `['image']` so each lang gets its own cover; blog and positions
 * pass nothing (cover stays shared).
 *
 * Wiping frontmatter wholesale would make the next Save fail with
 * "title is missing" / "category is missing", so we copy then drop
 * the per-lang keys. The same snapshot is mirrored into
 * `originalCache` so isDirty reports the freshly-switched draft as
 * clean and the unsaved-changes guard does not fire.
 *
 * @param cache - Per-lang draft cache
 * @param originalCache - Per-lang baseline for diffing
 * @param state - Editor state refs
 * @param lang - Target language we are switching INTO
 * @param fileSha - File SHA ref (cleared since the new file does not exist yet)
 * @param langScopedFields - Frontmatter keys that must NOT carry over
 */
export const seedFromCurrent = (
  cache: Map<Language, EditorDraft>,
  originalCache: Map<Language, EditorDraft>,
  state: MultiLangEditorState,
  lang: Language,
  fileSha: Ref<string>,
  langScopedFields: readonly string[]
): void => {
  const previous = state.frontmatterData.value
  const carried = dropFields(previous, langScopedFields)
  const seeded = { ...carried, lang }
  state.frontmatterData.value = seeded
  state.bodyContent.value = ''
  fileSha.value = ''
  const draft: EditorDraft = {
    frontmatter: { ...seeded },
    body: '',
    sha: '',
    loaded: true,
  }
  cache.set(lang, draft)
  originalCache.set(lang, { ...draft, frontmatter: { ...seeded } })
}
