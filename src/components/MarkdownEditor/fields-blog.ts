import type { FieldDefinition } from './frontmatter-fields'

/** Frontmatter fields for blog posts */
export const blogFields: readonly FieldDefinition[] = [
  {
    key: 'title',
    label: 'Title',
    type: 'text',
    required: true,
  },
  {
    key: 'description',
    label: 'Description',
    type: 'textarea',
    required: true,
  },
  {
    key: 'category',
    label: 'Category',
    type: 'text',
    required: true,
  },
  { key: 'published', label: 'Published', type: 'checkbox' },
  { key: 'publishDate', label: 'Publish Date', type: 'date' },
]
