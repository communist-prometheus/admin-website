import type { ContentType } from '@/types/content'

/**
 * Schema for a frontmatter form field
 */
export interface FieldDefinition {
  readonly key: string
  readonly label: string
  readonly type: 'text' | 'textarea' | 'number' | 'date'
  readonly required?: boolean
}

const blogFields: readonly FieldDefinition[] = [
  { key: 'title', label: 'Title', type: 'text', required: true },
  {
    key: 'description',
    label: 'Description',
    type: 'textarea',
    required: true,
  },
  { key: 'category', label: 'Category', type: 'text', required: true },
  { key: 'pubDate', label: 'Publication Date', type: 'date' },
]

const positionsFields: readonly FieldDefinition[] = [
  { key: 'title', label: 'Title', type: 'text', required: true },
  {
    key: 'description',
    label: 'Description',
    type: 'textarea',
    required: true,
  },
  { key: 'order', label: 'Order', type: 'number' },
]

const basePageFields: readonly FieldDefinition[] = [
  { key: 'title', label: 'Title', type: 'text', required: true },
  { key: 'description', label: 'Description', type: 'textarea' },
]

const pageFieldsBySlug: Readonly<Record<string, readonly FieldDefinition[]>> = {
  home: [
    ...basePageFields,
    { key: 'heroTitle', label: 'Hero Title', type: 'text' },
    { key: 'latestNews', label: 'Latest News Label', type: 'text' },
    { key: 'viewAllPosts', label: 'View All Posts Label', type: 'text' },
  ],
  'blog-listing': [
    ...basePageFields,
    { key: 'heading', label: 'Heading', type: 'text' },
    { key: 'allCategory', label: 'All Category Label', type: 'text' },
  ],
  'positions-listing': [
    ...basePageFields,
    { key: 'heading', label: 'Heading', type: 'text' },
  ],
  manifest: basePageFields,
}

const menuFields: readonly FieldDefinition[] = [
  { key: 'title', label: 'Title', type: 'text', required: true },
  { key: 'home', label: 'Home', type: 'text', required: true },
  { key: 'blog', label: 'Blog', type: 'text', required: true },
  { key: 'positions', label: 'Positions', type: 'text', required: true },
  { key: 'manifest', label: 'Manifest', type: 'text', required: true },
  { key: 'menu', label: 'Menu', type: 'text', required: true },
  { key: 'copyright', label: 'Copyright', type: 'text', required: true },
]

const labelsFields: readonly FieldDefinition[] = [
  { key: 'title', label: 'Title', type: 'text', required: true },
  { key: 'readMore', label: 'Read More', type: 'text', required: true },
  { key: 'viewAll', label: 'View All', type: 'text', required: true },
  { key: 'backToList', label: 'Back To List', type: 'text', required: true },
]

const commonFieldsBySlug: Readonly<Record<string, readonly FieldDefinition[]>> = {
  menu: menuFields,
  labels: labelsFields,
}

const fieldsByContentType: Readonly<Record<ContentType, readonly FieldDefinition[]>> = {
  blog: blogFields,
  positions: positionsFields,
  pages: basePageFields,
  common: labelsFields,
}

/**
 * Get field definitions for a content type, optionally refined by slug.
 * @param type - The content type
 * @param slug - Optional content slug for page/common-specific fields
 * @returns Array of field definitions
 */
export const getFields = (type: ContentType, slug?: string): readonly FieldDefinition[] => {
  if (slug && type === 'pages') return pageFieldsBySlug[slug] ?? basePageFields
  if (slug && type === 'common') return commonFieldsBySlug[slug] ?? labelsFields
  return fieldsByContentType[type] ?? []
}
