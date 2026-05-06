/** Discriminator for select-typed fields, naming the data source. */
export type SelectOptionsSource = 'labels'

interface BaseField {
  readonly key: string
  readonly label: string
  readonly required?: boolean
}

interface PrimitiveField extends BaseField {
  readonly type:
    | 'text'
    | 'textarea'
    | 'number'
    | 'date'
    | 'checkbox'
    | 'articles'
    | 'issue'
}

interface SelectField extends BaseField {
  readonly type: 'select'
  readonly optionsSource: SelectOptionsSource
}

/**
 * Schema for a frontmatter form field. Most types map 1:1 to a
 * native input. `select` is sourced from a named data set so the
 * renderer can pull localised options from a store.
 */
export type FieldDefinition = PrimitiveField | SelectField
