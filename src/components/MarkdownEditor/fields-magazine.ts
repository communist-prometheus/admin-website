import type { FieldDefinition } from './frontmatter-fields'

/**
 * Frontmatter fields shown on the magazine-issue edit page.
 * Description is optional — kept for parity with the create
 * dialog so editors can fill in a preface when wanted.
 */
export const magazineFields: readonly FieldDefinition[] = [
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
  },
  { key: 'published', label: 'Published', type: 'checkbox' },
  { key: 'publishDate', label: 'Publish Date', type: 'date' },
  { key: 'articles', label: 'Articles in this issue', type: 'articles' },
]
