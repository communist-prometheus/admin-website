import type { ContentType, Language } from '@/types/content'

/**
 * Data structure for content creation
 */
export interface CreateContentData {
  readonly slug: string
  readonly lang: Language
  readonly title: string
  readonly description?: string
  readonly category?: string
}

interface FormState {
  readonly slug: string
  readonly lang: Language
  readonly title: string
  readonly description: string
  readonly category: string
}

/**
 * Validate that required form fields are filled
 * @param state - Current form state
 * @returns Whether the form is valid
 */
export const isFormValid = (state: FormState): boolean =>
  state.slug.trim() !== '' && state.title.trim() !== ''

/**
 * Build content creation data from form state
 * @param contentType - Type of content being created
 * @param state - Current form state
 * @returns Structured content data for the API
 */
export const buildCreateData = (
  contentType: ContentType,
  state: FormState
): CreateContentData => {
  const baseData = {
    slug: state.slug.trim(),
    lang: state.lang,
    title: state.title.trim(),
  }

  if (contentType === 'blog') {
    return {
      ...baseData,
      description: state.description,
      category: state.category,
    }
  }

  if (contentType === 'positions' || contentType === 'newspaper') {
    return { ...baseData, description: state.description }
  }

  return baseData
}
