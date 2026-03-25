import type { Ref } from 'vue'
import { ref, toValue } from 'vue'
import type { ContentType } from '@/types/content'
import {
  createContentHandler,
  createSaveHandler,
} from './useContent/save-handler'
import { createSelectHandler } from './useContent/select-handler'
import { useContentCreator } from './useContent/useContentCreator'
import { useContentEditor } from './useContent/useContentEditor'
import { useContentList } from './useContent/useContentList'

/**
 * Main content management composable
 * @param contentType - Type of content to manage
 * @returns Content management interface
 */
export const useContent = (contentType: ContentType | Ref<ContentType>) => {
  const list = useContentList(contentType)
  const editor = useContentEditor()
  const creator = useContentCreator(() => toValue(contentType))
  const error = ref<string | null>(null)

  return {
    items: list.items,
    selectedItem: list.selectedItem,
    frontmatterData: editor.frontmatterData,
    bodyContent: editor.bodyContent,
    loadingList: list.loadingList,
    loadingFile: editor.loadingFile,
    error,
    loadContent: list.loadContent,
    selectItem: createSelectHandler(list, editor),
    saveContent: createSaveHandler(list, editor),
    createContent: createContentHandler(list, creator),
  }
}
