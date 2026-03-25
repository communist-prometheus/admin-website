import { Schema } from 'effect'

/** Schema for SW /api/github/file response. */
export const SWFileSchema = Schema.Struct({
  path: Schema.String,
  content: Schema.String,
  sha: Schema.String,
})

/** SW file response type. */
export type SWFile = typeof SWFileSchema.Type

/** Schema for SW /api/github/tree item. */
export const SWTreeItemSchema = Schema.Struct({
  path: Schema.String,
  sha: Schema.String,
  type: Schema.String,
  size: Schema.Number,
  name: Schema.String,
})

/** SW tree item type. */
export type SWTreeItem = typeof SWTreeItemSchema.Type

/** Schema for SW /api/github/tree response. */
export const SWTreeResponseSchema = Schema.Struct({
  tree: Schema.Array(SWTreeItemSchema),
})

/** SW tree response type. */
export type SWTreeResponse = typeof SWTreeResponseSchema.Type
