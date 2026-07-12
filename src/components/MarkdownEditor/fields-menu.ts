import type { FieldDefinition } from './frontmatter-fields'

/** Frontmatter fields for navigation menu */
export const menuFields: readonly FieldDefinition[] = [
  {
    key: 'title',
    label: 'Title',
    type: 'text',
    required: true,
  },
  { key: 'home', label: 'Home', type: 'text', required: true },
  { key: 'blog', label: 'Blog', type: 'text', required: true },
  {
    key: 'positions',
    label: 'Positions',
    type: 'text',
    required: true,
  },
  {
    key: 'manifest',
    label: 'Manifest',
    type: 'text',
    required: true,
  },
  {
    key: 'magazine',
    label: 'Magazine',
    type: 'text',
    required: true,
  },
  { key: 'menu', label: 'Menu', type: 'text', required: true },
  {
    key: 'copyright',
    label: 'Copyright',
    type: 'text',
    required: true,
  },
]
