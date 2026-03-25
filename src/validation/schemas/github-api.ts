import { Schema } from 'effect'

/** Schema for a GitHub tree item. */
export const GitHubTreeItemSchema = Schema.Struct({
  path: Schema.String,
  mode: Schema.String,
  type: Schema.Literal('blob', 'tree'),
  sha: Schema.String,
  size: Schema.optional(Schema.Number),
  url: Schema.String,
})

/** GitHub tree item type derived from schema. */
export type GitHubTreeItem = typeof GitHubTreeItemSchema.Type

/** Schema for GitHub tree API response. */
export const GitHubTreeResponseSchema = Schema.Struct({
  sha: Schema.String,
  url: Schema.String,
  tree: Schema.Array(GitHubTreeItemSchema),
  truncated: Schema.Boolean,
})

/** GitHub tree response type. */
export type GitHubTreeResponse = typeof GitHubTreeResponseSchema.Type

/** Schema for GitHub file content. */
export const GitHubFileContentSchema = Schema.Struct({
  name: Schema.String,
  path: Schema.String,
  sha: Schema.String,
  size: Schema.Number,
  url: Schema.String,
  html_url: Schema.String,
  git_url: Schema.String,
  download_url: Schema.String,
  type: Schema.Literal('file'),
  content: Schema.String,
  encoding: Schema.Literal('base64'),
})

/** GitHub file content type. */
export type GitHubFileContent = typeof GitHubFileContentSchema.Type
