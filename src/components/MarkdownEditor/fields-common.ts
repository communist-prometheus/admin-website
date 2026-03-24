import { labelsFields } from './fields-labels'
import { menuFields } from './fields-menu'
import type { FieldDefinition } from './frontmatter-fields'

export { labelsFields } from './fields-labels'
export { menuFields } from './fields-menu'

/** Common fields by slug */
export const commonFieldsBySlug: Readonly<
  Record<string, readonly FieldDefinition[]>
> = {
  menu: menuFields,
  labels: labelsFields,
}
