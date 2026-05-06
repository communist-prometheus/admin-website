import type { FieldDefinition } from './frontmatter-fields'

/**
 * Frontmatter fields shown on the blog edit page. Description is
 * optional — listings derive a preview from the body's first
 * paragraph when blank — but editors can still author one for the
 * preface block on the public site. Category is sourced from the
 * shared labels store so taxonomy stays consistent.
 */
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
  },
  {
    key: 'category',
    label: 'Category',
    type: 'select',
    optionsSource: 'labels',
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
