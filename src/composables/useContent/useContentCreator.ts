import { contentFile } from '@/config/content-paths'
import type { ContentType, Language } from '@/types/content'
import { stringifyFrontmatter } from '@/utils/frontmatter'
import { useGitHubApi } from '../useGitHubApi'

/**
 * Content creation composable
 * @param contentType - Type of content to create or function returning type
 * @returns Content creation interface
 */
export const useContentCreator = (
  contentType: ContentType | (() => ContentType)
) => {
  const { create } = useGitHubApi()

  const getContentType = () =>
    typeof contentType === 'function' ? contentType() : contentType

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
    const type = getContentType()
    const filePath = contentFile(type, data.slug, data.lang)

    const fileName = filePath.split('/').pop() ?? ''
    const frontmatter = buildFrontmatter(type, data)
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

  if (contentType === 'common') {
    frontmatter.readMore = ''
    frontmatter.viewAll = ''
    frontmatter.backToList = ''
  }

  return frontmatter
}
