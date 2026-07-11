import { Schema } from 'effect'

/**
 * Shape a committed magazine frontmatter must have before it hits git.
 * Mirrors public-website magazineCollection.
 */
export const MagazineFrontmatterSchema = Schema.Struct({
  title: Schema.String.pipe(Schema.nonEmptyString()),
  /* Description is optional now (#3) — see public-website#77. */
  description: Schema.optional(Schema.String),
  lang: Schema.String.pipe(Schema.nonEmptyString()),
  published: Schema.optional(Schema.Boolean),
  publishDate: Schema.optional(
    Schema.Union(Schema.String, Schema.DateFromSelf)
  ),
  image: Schema.optional(Schema.String),
})
