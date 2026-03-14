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
  const getRootPath = () => `src/content/${getContentType()}`

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
    const isBlog = getContentType() === 'blog'
    const fileName = isBlog
      ? `index.${data.lang}.md`
      : `${data.slug}.${data.lang}.md`
    const filePath = isBlog
      ? `${getRootPath()}/${data.slug}/${fileName}`
      : `${getRootPath()}/${fileName}`

    const frontmatter = buildFrontmatter(getContentType(), data)
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
