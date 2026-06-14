import type { FieldDefinition } from './frontmatter-fields'

/**
 * Frontmatter fields for an archive item. An archive item is a named
 * album whose real payload is the files in its `assets/` folder; the
 * body markdown is optional. Title is required for listings; the
 * description gives the album a short preface. Publish state mirrors
 * the other sections so archives flow through the same gate.
 */
export const archiveFields: readonly FieldDefinition[] = [
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
]
