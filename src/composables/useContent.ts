import type { Ref } from 'vue'
import { ref, toValue } from 'vue'
import type { ContentType } from '@/types/content'
import { useContentCreator } from './useContent/useContentCreator'
import { useContentEditor } from './useContent/useContentEditor'
import { useContentList } from './useContent/useContentList'

const createSelectHandler =
  (
    list: ReturnType<typeof useContentList>,
    editor: ReturnType<typeof useContentEditor>
  ) =>
  async (item: typeof list.selectedItem.value) => {
    if (!item) return
    list.selectedItem.value = item
    await editor.selectItem(item)
  }

const createSaveHandler =
  (
    list: ReturnType<typeof useContentList>,
    editor: ReturnType<typeof useContentEditor>
  ) =>
  async (message: string) => {
    if (!list.selectedItem.value) return
    await editor.saveContent(list.selectedItem.value.path, message)
    await list.loadContent()
  }

const createContentHandler =
  (
    list: ReturnType<typeof useContentList>,
    creator: ReturnType<typeof useContentCreator>
  ) =>
  async (...args: Parameters<typeof creator.createContent>) => {
    await creator.createContent(...args)
    await list.loadContent()
  }

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
