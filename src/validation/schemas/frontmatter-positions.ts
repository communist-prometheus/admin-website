import { Schema } from 'effect'

/**
 * Shape a committed positions frontmatter must have before it hits git.
 * Mirrors public-website positionsCollection.
 */
export const PositionsFrontmatterSchema = Schema.Struct({
  title: Schema.String.pipe(Schema.nonEmptyString()),
  description: Schema.String.pipe(Schema.nonEmptyString()),
  lang: Schema.String.pipe(Schema.nonEmptyString()),
  published: Schema.optional(Schema.Boolean),
  publishDate: Schema.optional(
    Schema.Union(Schema.String, Schema.DateFromSelf)
  ),
})
