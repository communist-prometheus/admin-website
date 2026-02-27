import type { ContentType, Language } from '@/types/content'
import { stringifyFrontmatter } from '@/utils/frontmatter'
import { useGitHubApi } from '../useGitHubApi'

/**
 * Content creation composable
 * @param contentType - Type of content to create
 * @returns Content creation interface
 */
export const useContentCreator = (contentType: ContentType) => {
  const { create } = useGitHubApi()
  const rootPath = `src/content/${contentType}`

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

    const frontmatter = buildFrontmatter(contentType, data)
    const content = stringifyFrontmatter(frontmatter, initialContent)

    await create(filePath, content, `Create ${fileName}`)
  }

  return { createContent }
}

const buildFrontmatter = (
  contentType: ContentType,
  data: {
    readonly title: string
    readonly lang: Language
    readonly description?: string
    readonly category?: string
    readonly order?: number
  }
): Record<string, unknown> => {
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

  return frontmatter
}
