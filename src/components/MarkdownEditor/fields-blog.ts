import type { FieldDefinition } from './frontmatter-fields'

/**
 * Frontmatter fields shown on the blog edit page. `description`
 * was retired (#3): the public site still renders an existing
 * description as a preface block, but new entries don't ask for
 * one — listings derive their preview from the body's first
 * paragraph instead.
 */
export const blogFields: readonly FieldDefinition[] = [
  {
    key: 'title',
    label: 'Title',
    type: 'text',
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
  {
    key: 'newspaper',
    label: 'Newspaper issue (optional)',
    type: 'issue',
  },
]
