import type { ContentType } from '@/types/content'
import {
  basePageFields,
  blogFields,
  commonFieldsBySlug,
  labelsFields,
  newspaperFields,
  pageFieldsBySlug,
  positionsFields,
} from './field-definitions'

/**
 * Schema for a frontmatter form field
 */
export interface FieldDefinition {
  readonly key: string
  readonly label: string
  readonly type: 'text' | 'textarea' | 'number' | 'date' | 'checkbox'
  readonly required?: boolean
}

const fieldsByContentType: Readonly<
  Record<ContentType, readonly FieldDefinition[]>
> = {
  blog: blogFields,
  positions: positionsFields,
  pages: basePageFields,
  common: labelsFields,
  newspaper: newspaperFields,
}

/**
 * Get field definitions for a content type.
 * @param type - The content type
 * @param slug - Optional slug for page/common-specific fields
 * @returns Array of field definitions
 */
export const getFields = (
  type: ContentType,
  slug?: string
): readonly FieldDefinition[] => {
  if (slug && type === 'pages')
    return pageFieldsBySlug[slug] ?? basePageFields
  if (slug && type === 'common')
    return commonFieldsBySlug[slug] ?? labelsFields
  return fieldsByContentType[type] ?? []
}
