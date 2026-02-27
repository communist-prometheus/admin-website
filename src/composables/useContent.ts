import { ref } from 'vue'
import type { ContentItem, ContentType, Language } from '@/types/content'
import { parseFrontmatter, stringifyFrontmatter } from '@/utils/frontmatter'
import { useGitHubApi } from './useGitHubApi'

/**
 * Parse a content file from GitHub
 * @param filePath - Path to the file
 * @param getFile - Function to get file content
 * @returns Parsed content item or null
 */
const parseContentFile = async (
  filePath: string,
  getFile: ReturnType<typeof useGitHubApi>['getFile']
): Promise<ContentItem | null> => {
  try {
    const fileData = await getFile(filePath)
    const { frontmatter } = parseFrontmatter(fileData.content)

    const pathParts = filePath.split('/')
    const fileName = pathParts[pathParts.length - 1]
    if (!fileName) return null

    const match = fileName.match(/^(.+)\.(en|ru|it|es)\.md$/)
    if (!match) return null

    const [, slug, lang] = match
    if (!slug || !lang) return null

    return {
      path: filePath,
      slug,
      lang: lang as Language,
      frontmatter: frontmatter as unknown as ContentItem['frontmatter'],
    }
  } catch {
    return null
  }
}

/**
 * Composable for managing content files
 * @param contentType - Type of content to manage
 * @returns Content management methods and state
 */
export const useContent = (contentType: ContentType) => {
  const { getTree, getFile, create, update, loading, error } = useGitHubApi()

  const items = ref<readonly ContentItem[]>([])
  const selectedItem = ref<ContentItem | null>(null)
  const fileContent = ref('')
  const fileSha = ref('')

  const rootPath = `src/content/${contentType}`

  const loadContent = async () => {
    try {
      const result = await getTree(rootPath)
      const mdFiles = result.tree.filter(
        item => item.type === 'blob' && item.path.endsWith('.md')
      )

      const parsePromises = mdFiles.map(file =>
        parseContentFile(file.path, getFile)
      )
      const parsedFiles = await Promise.all(parsePromises)

      items.value = parsedFiles.filter(
        (item): item is ContentItem => item !== null
      )
    } catch {
      // Error handled by useGitHubApi
    }
  }

  const selectItem = async (item: ContentItem) => {
    selectedItem.value = item
    try {
      const file = await getFile(item.path)
      fileContent.value = file.content
      fileSha.value = file.sha
    } catch {
      // Error handled by useGitHubApi
    }
  }

  const saveContent = async (message: string) => {
    if (!selectedItem.value) return
    try {
      await update(
        selectedItem.value.path,
        fileContent.value,
        message,
        fileSha.value
      )
      await loadContent()
    } catch {
      // Error handled by useGitHubApi
    }
  }

  const createContent = async (
    data: {
      readonly slug: string
      readonly lang: Language
      readonly title: string
      readonly description?: string
      readonly category?: string
      readonly order?: number
    },
    initialContent = ''
  ) => {
    const fileName = `${data.slug}.${data.lang}.md`
    const filePath = `${rootPath}/${fileName}`

    const frontmatter: Record<string, unknown> = {
      title: data.title,
      lang: data.lang,
    }

    if (contentType === 'blog') {
      frontmatter.description = data.description || ''
      frontmatter.category = data.category || ''
      frontmatter.pubDate = new Date()
    }

    if (contentType === 'positions') {
      frontmatter.description = data.description || ''
      frontmatter.order = data.order || 1
    }

    const content = stringifyFrontmatter(frontmatter, initialContent)

    try {
      await create(filePath, content, `Create ${fileName}`)
      await loadContent()
    } catch {
      // Error handled by useGitHubApi
    }
  }

  return {
    items,
    selectedItem,
    fileContent,
    loading,
    error,
    loadContent,
    selectItem,
    saveContent,
    createContent,
  }
}
