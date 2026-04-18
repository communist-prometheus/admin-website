import {
  deleteAllVersions,
  deleteSingleVersion,
} from '@/composables/useGitHubApi/delete-content'
import type { ContentItem, Language } from '@/types/content'

interface DeleteDeps {
  readonly contentType: string
  readonly selectedLang: Language
  readonly reload: () => Promise<void>
  readonly clearTarget: () => void
  readonly pushAndTrack: (message: string) => Promise<string>
}

/**
 * Create delete handlers for content list.
 * Stages deletion, then commits+pushes via unified pushAndTrack.
 * @param deps - Dependencies
 * @returns Handlers for delete-all and delete-lang
 */
export const createDeleteHandlers = (deps: DeleteDeps) => ({
  deleteAll: async (item: ContentItem) => {
    await deleteAllVersions(deps.contentType, item.slug)
    await deps.pushAndTrack(
      `Delete all versions of ${deps.contentType}/${item.slug}`
    )
    deps.clearTarget()
    await deps.reload()
  },
  deleteLang: async (item: ContentItem) => {
    await deleteSingleVersion(deps.contentType, item.slug, deps.selectedLang)
    await deps.pushAndTrack(
      `Delete ${deps.contentType}/${item.slug}.${deps.selectedLang}.md`
    )
    deps.clearTarget()
    await deps.reload()
  },
})
