import type { FieldDefinition } from './frontmatter-fields'

/** Frontmatter fields for blog posts */
export const blogFields: readonly FieldDefinition[] = [
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

/** Frontmatter fields for positions */
export const positionsFields: readonly FieldDefinition[] = [
  { key: 'title', label: 'Title', type: 'text', required: true },
  {
    key: 'description',
    label: 'Description',
    type: 'textarea',
    required: true,
  },
  { key: 'order', label: 'Order', type: 'number' },
]

/** Base frontmatter fields for pages */
export const basePageFields: readonly FieldDefinition[] = [
  { key: 'title', label: 'Title', type: 'text', required: true },
  { key: 'description', label: 'Description', type: 'textarea' },
]

/** Page-specific fields by slug */
export const pageFieldsBySlug: Readonly<
  Record<string, readonly FieldDefinition[]>
> = {
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

/** Frontmatter fields for navigation menu */
export const menuFields: readonly FieldDefinition[] = [
  { key: 'title', label: 'Title', type: 'text', required: true },
  { key: 'home', label: 'Home', type: 'text', required: true },
  { key: 'blog', label: 'Blog', type: 'text', required: true },
  { key: 'positions', label: 'Positions', type: 'text', required: true },
  { key: 'manifest', label: 'Manifest', type: 'text', required: true },
  { key: 'menu', label: 'Menu', type: 'text', required: true },
  { key: 'copyright', label: 'Copyright', type: 'text', required: true },
]

/** Frontmatter fields for common labels */
export const labelsFields: readonly FieldDefinition[] = [
  { key: 'title', label: 'Title', type: 'text', required: true },
  { key: 'readMore', label: 'Read More', type: 'text', required: true },
  { key: 'viewAll', label: 'View All', type: 'text', required: true },
  { key: 'backToList', label: 'Back To List', type: 'text', required: true },
]

/** Common fields by slug */
export const commonFieldsBySlug: Readonly<
  Record<string, readonly FieldDefinition[]>
> = {
  menu: menuFields,
  labels: labelsFields,
}
