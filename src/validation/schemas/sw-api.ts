import { Schema } from 'effect'

/** Schema for SW /api/github/file response. */
export const SWFileSchema = Schema.Struct({
  path: Schema.String,
  content: Schema.String,
  sha: Schema.String,
})

/** SW file response type. */
export type SWFile = typeof SWFileSchema.Type

/** Schema for SW file stage result (POST /api/github/file). */
export const StagedResultSchema = Schema.Struct({
  content: Schema.Struct({ sha: Schema.String }),
  staged: Schema.Boolean,
})

/** Staged result type. */
export type StagedResponse = typeof StagedResultSchema.Type

/** Schema for SW commit result (PUT /api/github/file). */
export const CommitResultSchema = Schema.Struct({
  content: Schema.Struct({ sha: Schema.String }),
  commit: Schema.Struct({ sha: Schema.String }),
})

/** Commit result type. */
export type CommitResponse = typeof CommitResultSchema.Type

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
