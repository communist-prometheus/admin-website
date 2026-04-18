import type { FieldDefinition } from './frontmatter-fields'

/** Frontmatter fields for newspaper entries */
export const newspaperFields: readonly FieldDefinition[] = [
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
  { key: 'published', label: 'Published', type: 'checkbox' },
  { key: 'publishDate', label: 'Publish Date', type: 'date' },
]
