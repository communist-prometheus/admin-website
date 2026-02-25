import { ref } from 'vue'
import { createCreateFileHandler } from './useGitHubApi/create-file-handler'
import { createGetFileHandler } from './useGitHubApi/get-file-handler'
import { createGetTreeHandler } from './useGitHubApi/get-tree-handler'
import { createUpdateFileHandler } from './useGitHubApi/update-file-handler'

export const useGitHubApi = () => {
  const loading = ref(false)
  const error = ref<string | null>(null)

  return {
    loading,
    error,
    getTree: createGetTreeHandler(loading, error),
    getFile: createGetFileHandler(loading, error),
    create: createCreateFileHandler(loading, error),
    update: createUpdateFileHandler(loading, error),
  }
}

export type {
  GitHubFileContent,
  GitHubTreeItem,
  GitHubTreeResponse,
} from './useGitHubApi/types'
