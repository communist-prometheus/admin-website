import { Schema } from 'effect'

/** Schema for an asset list item from SW. */
export const AssetItemSchema = Schema.Struct({
  path: Schema.String,
  name: Schema.String,
  mimeType: Schema.String,
})

/** Asset item type derived from schema. */
export type AssetItem = typeof AssetItemSchema.Type

/** Schema for asset content with base64 data. */
export const AssetContentSchema = Schema.Struct({
  path: Schema.String,
  content: Schema.String,
  mimeType: Schema.String,
})

/** Asset content type derived from schema. */
export type AssetContent = typeof AssetContentSchema.Type
