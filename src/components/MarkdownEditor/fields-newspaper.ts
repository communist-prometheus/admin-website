import type { FieldDefinition } from './frontmatter-fields'

/**
 * Frontmatter fields shown on the newspaper-issue edit page.
 * `description` retired — see fields-blog.ts.
 */
export const newspaperFields: readonly FieldDefinition[] = [
  {
    key: 'title',
    label: 'Title',
    type: 'text',
    required: true,
  },
  { key: 'published', label: 'Published', type: 'checkbox' },
  { key: 'publishDate', label: 'Publish Date', type: 'date' },
  { key: 'articles', label: 'Articles in this issue', type: 'articles' },
]
