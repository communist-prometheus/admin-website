import { Schema } from 'effect'

/**
 * Shape a committed archive-item frontmatter must have before it hits
 * git. An archive item is an album whose payload is its `assets/`
 * files; the frontmatter only carries listing metadata. Mirrors the
 * public-website archiveCollection.
 */
export const ArchiveFrontmatterSchema = Schema.Struct({
  title: Schema.String.pipe(Schema.nonEmptyString()),
  description: Schema.optional(Schema.String),
  lang: Schema.String.pipe(Schema.nonEmptyString()),
  published: Schema.optional(Schema.Boolean),
  publishDate: Schema.optional(
    Schema.Union(Schema.String, Schema.DateFromSelf)
  ),
})
