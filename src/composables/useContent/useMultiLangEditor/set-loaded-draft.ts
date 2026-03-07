import type { Language } from '@/types/content'
import type { EditorDraft } from './types'

/**
 * Creates and stores a loaded draft in both caches
 * @param cache - Draft cache map
 * @param originalCache - Original draft cache for clean state
 * @param lang - Language key
 * @param fm - Parsed frontmatter
 * @param body - Parsed body content
 * @param sha - File SHA
 */
export const setLoadedDraft = (
  cache: Map<Language, EditorDraft>,
  originalCache: Map<Language, EditorDraft>,
  lang: Language,
  fm: Record<string, unknown>,
  body: string,
  sha: string
): void => {
  const draft: EditorDraft = {
    frontmatter: { ...fm },
    body,
    sha,
    loaded: true,
  }
  cache.set(lang, draft)
  originalCache.set(lang, { ...draft })
}
