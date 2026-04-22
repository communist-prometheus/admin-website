import { Schema } from 'effect'

/**
 * Shape a committed newspaper frontmatter must have before it hits git.
 * Mirrors public-website newspaperCollection.
 */
export const NewspaperFrontmatterSchema = Schema.Struct({
  title: Schema.String.pipe(Schema.nonEmptyString()),
  description: Schema.String.pipe(Schema.nonEmptyString()),
  lang: Schema.String.pipe(Schema.nonEmptyString()),
  published: Schema.optional(Schema.Boolean),
  publishDate: Schema.optional(
    Schema.Union(Schema.String, Schema.DateFromSelf)
  ),
  image: Schema.optional(Schema.String),
})
