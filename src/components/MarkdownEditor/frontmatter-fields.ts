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

const pagesFields: readonly FieldDefinition[] = [
  { key: 'title', label: 'Title', type: 'text', required: true },
  { key: 'description', label: 'Description', type: 'textarea' },
  { key: 'heroTitle', label: 'Hero Title', type: 'text' },
  { key: 'heading', label: 'Heading', type: 'text' },
  { key: 'latestNews', label: 'Latest News Label', type: 'text' },
  { key: 'viewAllPosts', label: 'View All Posts Label', type: 'text' },
  { key: 'allCategory', label: 'All Category Label', type: 'text' },
  { key: 'readMore', label: 'Read More Label', type: 'text' },
  { key: 'viewAll', label: 'View All Label', type: 'text' },
  { key: 'backToList', label: 'Back To List Label', type: 'text' },
]

const navFields: readonly FieldDefinition[] = [
  { key: 'title', label: 'Title', type: 'text', required: true },
  { key: 'home', label: 'Home', type: 'text', required: true },
  { key: 'blog', label: 'Blog', type: 'text', required: true },
  { key: 'positions', label: 'Positions', type: 'text', required: true },
  { key: 'manifest', label: 'Manifest', type: 'text', required: true },
  { key: 'menu', label: 'Menu', type: 'text', required: true },
  { key: 'copyright', label: 'Copyright', type: 'text', required: true },
]

const fieldsByContentType: Record<ContentType, readonly FieldDefinition[]> = {
  blog: blogFields,
  positions: positionsFields,
  pages: pagesFields,
  nav: navFields,
}

/**
 * Get field definitions for a content type
 * @param type - The content type
 * @returns Array of field definitions
 */
export const getFields = (type: ContentType): readonly FieldDefinition[] =>
  fieldsByContentType[type] ?? []
