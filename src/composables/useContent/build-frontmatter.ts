import type { ContentType, Language } from '@/types/content'
import { extrasByType } from './frontmatter-extras'

/** Input data for content creation */
export interface FrontmatterInput {
  readonly slug: string
  readonly title: string
  readonly lang: Language
  readonly description?: string
  readonly category?: string
}

/**
 * Build frontmatter record for a given content type.
 * @param contentType - The content type
 * @param data - Input data for building frontmatter
 * @returns Frontmatter record
 */
export const buildFrontmatter = (
  contentType: ContentType,
  data: FrontmatterInput
): Record<string, unknown> => ({
  title: data.title,
  lang: data.lang,
  ...extrasByType[contentType]?.(data),
})
