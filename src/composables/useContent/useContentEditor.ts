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

  const selectItem = async (item: ContentItem) => {
    console.log('selectItem called', item.path)
    const file = await getFile(item.path)
    console.log('file loaded', { contentLength: file.content.length, sha: file.sha })
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
