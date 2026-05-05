import {
  deleteAllVersions,
  deleteSingleVersion,
} from '@/composables/useGitHubApi/delete-content'
import type { ContentItem, Language } from '@/types/content'
import { getAvailableLanguages } from '@/utils/available-languages'

interface DeleteDeps {
  /*
   * Read at call time, not at init time. Earlier we captured
   * `.value` once when `createDeleteHandlers` was constructed —
   * after the editor switched language the handler kept sending
   * DELETE for the original lang, the file didn't exist, and
   * "Delete only X" looked like a no-op.
   */
  readonly contentType: () => string
  readonly selectedLang: () => Language
  readonly listItems: () => readonly ContentItem[]
  readonly reload: () => Promise<void>
  readonly clearTarget: () => void
  readonly pushAndTrack: (message: string) => Promise<string>
}

const isLastLang = (
  items: readonly ContentItem[],
  slug: string,
  lang: Language
): boolean => {
  const langs = getAvailableLanguages(items, slug)
  return langs.size === 1 && langs.has(lang)
}

/**
 * Create delete handlers for content list.
 * Stages deletion, then commits+pushes via unified pushAndTrack.
 * `contentType` and `selectedLang` are getters so the handlers
 * pick up the latest selection on each click — capturing them by
 * value at construction time was the bug behind "Delete only X
 * does nothing" (the closure kept a stale lang).
 *
 * "Delete only X" promotes to delete-all when X is the only
 * translation that exists for the slug — otherwise we'd leave the
 * slug folder around with just `assets/` orphans.
 *
 * @param deps - Dependencies (getters + callbacks)
 * @returns Handlers for delete-all and delete-lang
 */
export const createDeleteHandlers = (deps: DeleteDeps) => ({
  deleteAll: async (item: ContentItem) => {
    const type = deps.contentType()
    await deleteAllVersions(type, item.slug)
    await deps.pushAndTrack(`Delete all versions of ${type}/${item.slug}`)
    deps.clearTarget()
    await deps.reload()
  },
  deleteLang: async (item: ContentItem) => {
    const type = deps.contentType()
    const lang = deps.selectedLang()
    const promote = isLastLang(deps.listItems(), item.slug, lang)
    const action = promote
      ? () => deleteAllVersions(type, item.slug)
      : () => deleteSingleVersion(type, item.slug, lang)
    const message = promote
      ? `Delete all versions of ${type}/${item.slug}`
      : `Delete ${type}/${item.slug}.${lang}.md`
    await action()
    await deps.pushAndTrack(message)
    deps.clearTarget()
    await deps.reload()
  },
})
