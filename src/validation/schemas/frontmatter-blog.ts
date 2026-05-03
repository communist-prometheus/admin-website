import { Schema } from 'effect'

/**
 * Shape a committed blog frontmatter must have before it hits git.
 * Mirrors public-website src/content.config.ts blogCollection.
 * Date values are accepted as ISO strings or Date (YAML parsers vary).
 */
export const BlogFrontmatterSchema = Schema.Struct({
  title: Schema.String.pipe(Schema.nonEmptyString()),
  /* Description is optional now (#3) — see public-website#77. */
  description: Schema.optional(Schema.String),
  category: Schema.String.pipe(Schema.nonEmptyString()),
  lang: Schema.String.pipe(Schema.nonEmptyString()),
  published: Schema.optional(Schema.Boolean),
  publishDate: Schema.optional(
    Schema.Union(Schema.String, Schema.DateFromSelf)
  ),
  image: Schema.optional(Schema.String),
})
