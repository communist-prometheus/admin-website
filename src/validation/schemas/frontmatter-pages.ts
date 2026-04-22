import { Schema } from 'effect'

/**
 * Shape a committed pages frontmatter must have before it hits git.
 * Mirrors public-website pagesCollection — pages have no publish gate.
 */
export const PagesFrontmatterSchema = Schema.Struct({
  title: Schema.String.pipe(Schema.nonEmptyString()),
  lang: Schema.String.pipe(Schema.nonEmptyString()),
  description: Schema.optional(Schema.String),
})
