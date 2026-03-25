import type { FieldDefinition } from './frontmatter-fields'

/** Frontmatter fields for common labels */
export const labelsFields: readonly FieldDefinition[] = [
  {
    key: 'title',
    label: 'Title',
    type: 'text',
    required: true,
  },
  {
    key: 'readMore',
    label: 'Read More',
    type: 'text',
    required: true,
  },
  {
    key: 'viewAll',
    label: 'View All',
    type: 'text',
    required: true,
  },
  {
    key: 'backToList',
    label: 'Back To List',
    type: 'text',
    required: true,
  },
]
