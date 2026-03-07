import { type Ref, ref } from 'vue'
import type { ContentItem } from '@/types/content'
import { parseFrontmatter } from '@/utils/frontmatter/parse'
import { stringifyFrontmatter } from '@/utils/frontmatter/stringify'
import { useGitHubApi } from '../useGitHubApi'

interface EditorState {
  readonly frontmatterData: Ref<Record<string, unknown>>
  readonly bodyContent: Ref<string>
  readonly fileSha: Ref<string>
  readonly loadingFile: Ref<boolean>
}

const createSelectItem =
  (getFile: ReturnType<typeof useGitHubApi>['getFile'], state: EditorState) =>
  async (item: ContentItem) => {
    state.loadingFile.value = true
    try {
      const file = await getFile(item.path)
      const parsed = parseFrontmatter(file.content)
      state.frontmatterData.value = { ...parsed.frontmatter }
      state.bodyContent.value = parsed.content
      state.fileSha.value = file.sha
    } finally {
      state.loadingFile.value = false
    }
  }

const createSaveContent =
  (update: ReturnType<typeof useGitHubApi>['update'], state: EditorState) =>
  async (path: string, message: string) => {
    const fullContent = stringifyFrontmatter(
      state.frontmatterData.value,
      state.bodyContent.value
    )
    await update(path, fullContent, message, state.fileSha.value)
  }

/**
 * Content editing composable with frontmatter separation
 * @returns Content editing interface
 */
export const useContentEditor = () => {
  const { getFile, update } = useGitHubApi()
  const state: EditorState = {
    frontmatterData: ref<Record<string, unknown>>({}),
    bodyContent: ref(''),
    fileSha: ref(''),
    loadingFile: ref(false),
  }

  return {
    frontmatterData: state.frontmatterData,
    bodyContent: state.bodyContent,
    loadingFile: state.loadingFile,
    selectItem: createSelectItem(getFile, state),
    saveContent: createSaveContent(update, state),
  }
}
