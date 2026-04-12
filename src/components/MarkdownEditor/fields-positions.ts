import type { FieldDefinition } from './frontmatter-fields'

/** Frontmatter fields for positions */
export const positionsFields: readonly FieldDefinition[] = [
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
  { key: 'pubDate', label: 'Publication Date', type: 'date' },
]
