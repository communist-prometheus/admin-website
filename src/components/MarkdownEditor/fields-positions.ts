import type { FieldDefinition } from './frontmatter-fields'

/**
 * Frontmatter fields shown on the positions edit page.
 * `description` retired — see fields-blog.ts.
 */
export const positionsFields: readonly FieldDefinition[] = [
  {
    key: 'title',
    label: 'Title',
    type: 'text',
    required: true,
  },
  { key: 'published', label: 'Published', type: 'checkbox' },
  { key: 'publishDate', label: 'Publish Date', type: 'date' },
]
