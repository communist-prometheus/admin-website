import { Schema } from 'effect'

/**
 * Schema for frontmatter data (open record of unknown values).
 */
const FrontmatterSchema = Schema.Record({
  key: Schema.String,
  value: Schema.Unknown,
})

/**
 * Schema for a single content item from the SW response.
 */
export const ContentItemSchema = Schema.Struct({
  path: Schema.String,
  slug: Schema.String,
  frontmatter: FrontmatterSchema,
})

/** Content item type derived from schema. */
export type ContentItemRaw = typeof ContentItemSchema.Type

/**
 * Schema for the content list API response.
 */
export const ContentListResponseSchema = Schema.Struct({
  items: Schema.Array(ContentItemSchema),
})

/** Content list response type derived from schema. */
export type ContentListResponse = typeof ContentListResponseSchema.Type
