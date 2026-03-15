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
}

/**
 * Create delete handlers for content list.
 * @param deps - Dependencies
 * @returns Handlers for delete-all and delete-lang
 */
export const createDeleteHandlers = (deps: DeleteDeps) => ({
  deleteAll: async (item: ContentItem) => {
    await deleteAllVersions(deps.contentType, item.slug)
    deps.clearTarget()
    await deps.reload()
  },
  deleteLang: async (item: ContentItem) => {
    await deleteSingleVersion(deps.contentType, item.slug, deps.selectedLang)
    deps.clearTarget()
    await deps.reload()
  },
})
