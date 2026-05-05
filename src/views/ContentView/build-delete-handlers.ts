import type { Ref } from 'vue'
import type { ContentItem, ContentType, Language } from '@/types/content'
import { createDeleteHandlers } from './create-delete-handlers'

interface CreateDeps {
  readonly contentType: Ref<ContentType>
  readonly selectedLang: Ref<Language>
  readonly listItems: Ref<readonly ContentItem[]>
  readonly reload: () => Promise<void>
  readonly pushAndTrack: (message: string) => Promise<string>
}

/**
 * Wire reactive refs to `createDeleteHandlers` getters so the
 * handlers always read the current selection on each invocation.
 *
 * @param d - Reactive deps
 * @returns Raw delete handlers (deleteAll, deleteLang)
 */
export const buildDeleteHandlers = (d: CreateDeps) =>
  createDeleteHandlers({
    contentType: () => d.contentType.value,
    selectedLang: () => d.selectedLang.value,
    listItems: () => d.listItems.value,
    reload: d.reload,
    clearTarget: () => undefined,
    pushAndTrack: d.pushAndTrack,
  })
