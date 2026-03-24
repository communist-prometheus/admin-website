import type { useContentCreator } from './useContentCreator'
import type { useContentEditor } from './useContentEditor'
import type { useContentList } from './useContentList'

/**
 * Create handler to save content and reload list.
 * @param list - Content list composable
 * @param editor - Content editor composable
 * @returns Async save handler
 */
export const createSaveHandler =
  (
    list: ReturnType<typeof useContentList>,
    editor: ReturnType<typeof useContentEditor>
  ) =>
  async (message: string): Promise<void> => {
    if (!list.selectedItem.value) return
    await editor.saveContent(list.selectedItem.value.path, message)
    await list.loadContent()
  }

/**
 * Create handler to create content and reload list.
 * @param list - Content list composable
 * @param creator - Content creator composable
 * @returns Async create handler
 */
export const createContentHandler =
  (
    list: ReturnType<typeof useContentList>,
    creator: ReturnType<typeof useContentCreator>
  ) =>
  async (
    ...args: Parameters<typeof creator.createContent>
  ): Promise<void> => {
    await creator.createContent(...args)
    await list.loadContent()
  }
