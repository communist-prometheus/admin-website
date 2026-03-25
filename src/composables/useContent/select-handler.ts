import type { useContentEditor } from './useContentEditor'
import type { useContentList } from './useContentList'

/**
 * Create handler to select and load a content item.
 * @param list - Content list composable
 * @param editor - Content editor composable
 * @returns Async select handler
 */
export const createSelectHandler =
  (
    list: ReturnType<typeof useContentList>,
    editor: ReturnType<typeof useContentEditor>
  ) =>
  async (item: typeof list.selectedItem.value): Promise<void> => {
    if (!item) return
    list.selectedItem.value = item
    await editor.selectItem(item)
  }
