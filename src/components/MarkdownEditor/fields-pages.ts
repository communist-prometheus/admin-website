import type { FieldDefinition } from './frontmatter-fields'

/** Base frontmatter fields for pages */
export const basePageFields: readonly FieldDefinition[] = [
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
]

/** Page-specific fields by slug */
export const pageFieldsBySlug: Readonly<
  Record<string, readonly FieldDefinition[]>
> = {
  home: [
    ...basePageFields,
    { key: 'heroTitle', label: 'Hero Title', type: 'text' },
    {
      key: 'latestNews',
      label: 'Latest News Label',
      type: 'text',
    },
    {
      key: 'viewAllPosts',
      label: 'View All Posts Label',
      type: 'text',
    },
  ],
  'blog-listing': [
    ...basePageFields,
    { key: 'heading', label: 'Heading', type: 'text' },
    {
      key: 'allCategory',
      label: 'All Category Label',
      type: 'text',
    },
  ],
  'positions-listing': [
    ...basePageFields,
    { key: 'heading', label: 'Heading', type: 'text' },
  ],
  manifest: basePageFields,
  about: basePageFields,
}
