import type { ContentType } from '@/types/content'
import { useContentCreator } from './useContent/useContentCreator'
import { useContentEditor } from './useContent/useContentEditor'
import { useContentList } from './useContent/useContentList'
import { useGitHubApi } from './useGitHubApi'

export const useContent = (contentType: ContentType) => {
  const { loading, error } = useGitHubApi()
  const { items, selectedItem, loadContent } = useContentList(contentType)
  const { fileContent, selectItem, saveContent } = useContentEditor()
  const { createContent } = useContentCreator(contentType)

  const handleSelectItem = async (item: typeof selectedItem.value) => {
    if (!item) return
    selectedItem.value = item
    await selectItem(item)
  }

  const handleSaveContent = async (message: string) => {
    if (!selectedItem.value) return
    await saveContent(selectedItem.value.path, message)
    await loadContent()
  }

  const handleCreateContent = async (
    ...args: Parameters<typeof createContent>
  ) => {
    await createContent(...args)
    await loadContent()
  }

  return {
    items,
    selectedItem,
    fileContent,
    loading,
    error,
    loadContent,
    selectItem: handleSelectItem,
    saveContent: handleSaveContent,
    createContent: handleCreateContent,
  }
}
