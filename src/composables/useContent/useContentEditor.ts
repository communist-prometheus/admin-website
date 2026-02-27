import { ref } from 'vue'
import type { ContentItem } from '@/types/content'
import { useGitHubApi } from '../useGitHubApi'

export const useContentEditor = () => {
  const { getFile, update } = useGitHubApi()
  const fileContent = ref('')
  const fileSha = ref('')

  const selectItem = async (item: ContentItem) => {
    const file = await getFile(item.path)
    fileContent.value = file.content
    fileSha.value = file.sha
  }

  const saveContent = async (path: string, message: string) => {
    await update(path, fileContent.value, message, fileSha.value)
  }

  return {
    fileContent,
    selectItem,
    saveContent,
  }
}
