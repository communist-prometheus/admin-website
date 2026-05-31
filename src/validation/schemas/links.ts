import { Schema } from 'effect'

/**
 * One curated external link, mirroring the public-website content
 * file `settings/links.json`. `descriptions` is a per-language map
 * (lang code → text); `inRing` marks webring members.
 */
export const LinkEntrySchema = Schema.Struct({
  url: Schema.String,
  name: Schema.String,
  category: Schema.String,
  inRing: Schema.Boolean,
  descriptions: Schema.Record({ key: Schema.String, value: Schema.String }),
})

/** Link entry type derived from the schema. */
export type LinkEntry = typeof LinkEntrySchema.Type

/** The whole `settings/links.json` document. */
export const LinksDocSchema = Schema.Struct({
  groups: Schema.Array(Schema.String),
  entries: Schema.Array(LinkEntrySchema),
})

/** Links document type derived from the schema. */
export type LinksDoc = typeof LinksDocSchema.Type
