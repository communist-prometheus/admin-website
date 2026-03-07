import type { ContentType } from '@/types/content'

/**
 * Schema for a frontmatter form field
 */
export interface FieldDefinition {
  readonly key: string
  readonly label: string
  readonly type: 'text' | 'textarea' | 'number' | 'date'
  readonly required?: boolean
}

const blogFields: readonly FieldDefinition[] = [
  { key: 'title', label: 'Title', type: 'text', required: true },
  {
    key: 'description',
    label: 'Description',
    type: 'textarea',
    required: true,
  },
  { key: 'category', label: 'Category', type: 'text', required: true },
  { key: 'pubDate', label: 'Publication Date', type: 'date' },
  { key: 'image', label: 'Image URL', type: 'text' },
]

const positionsFields: readonly FieldDefinition[] = [
  { key: 'title', label: 'Title', type: 'text', required: true },
  {
    key: 'description',
    label: 'Description',
    type: 'textarea',
    required: true,
  },
  { key: 'order', label: 'Order', type: 'number' },
]

const pagesFields: readonly FieldDefinition[] = [
  { key: 'title', label: 'Title', type: 'text', required: true },
]

const fieldsByContentType: Record<ContentType, readonly FieldDefinition[]> = {
  blog: blogFields,
  positions: positionsFields,
  pages: pagesFields,
}

/**
 * Get field definitions for a content type
 * @param type - The content type
 * @returns Array of field definitions
 */
export const getFields = (type: ContentType): readonly FieldDefinition[] =>
  fieldsByContentType[type] ?? []
