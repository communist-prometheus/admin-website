import { contentFile } from '@/config/content-paths'
import type { ContentType } from '@/types/content'
import { stringifyFrontmatter } from '@/utils/frontmatter'
import { useGitHubApi } from '../useGitHubApi'
import type { FrontmatterInput } from './build-frontmatter'
import { buildFrontmatter } from './build-frontmatter'

/**
 * Content creation composable — stages the file only.
 * Caller is responsible for commit+push via pushAndTrack.
 * @param contentType - Type or getter for content type
 * @returns Content creation interface
 */
export const useContentCreator = (
  contentType: ContentType | (() => ContentType)
) => {
  const { create } = useGitHubApi()

  const getContentType = () =>
    typeof contentType === 'function' ? contentType() : contentType

  const createContent = async (
    data: FrontmatterInput,
    initialContent = ''
  ) => {
    const type = getContentType()
    const filePath = contentFile(type, data.slug, data.lang)
    const fm = buildFrontmatter(type, data)
    const content = stringifyFrontmatter(fm, initialContent)
    await create(filePath, content, `Create ${data.slug} in ${type}`)
  }

  return { createContent }
}
