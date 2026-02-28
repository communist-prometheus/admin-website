import { ref } from 'vue'
import type { ContentItem } from '@/types/content'
import { useGitHubApi } from '../useGitHubApi'

/**
 * Content editing composable
 * @returns Content editing interface
 */
export const useContentEditor = () => {
  const { getFile, update } = useGitHubApi()
  const fileContent = ref('')
  const fileSha = ref('')
  const loadingFile = ref(false)

  const selectItem = async (item: ContentItem) => {
    loadingFile.value = true
    try {
      const file = await getFile(item.path)
      fileContent.value = file.content
      fileSha.value = file.sha
    } finally {
      loadingFile.value = false
    }
  }

  const saveContent = async (path: string, message: string) => {
    await update(path, fileContent.value, message, fileSha.value)
  }

  return {
    fileContent,
    loadingFile,
    selectItem,
    saveContent,
  }
}
