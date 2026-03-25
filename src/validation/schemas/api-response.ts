import { Schema } from 'effect'

/**
 * Schema for a generic success/failure API response.
 */
export const SuccessResponseSchema = Schema.Struct({
  success: Schema.Boolean,
})

/** Success response type derived from schema. */
export type SuccessResponse = typeof SuccessResponseSchema.Type

/**
 * Schema for commit response (includes SHA).
 */
export const CommitResponseSchema = Schema.Struct({
  success: Schema.Boolean,
  sha: Schema.String,
})

/** Commit response type derived from schema. */
export type CommitResponse = typeof CommitResponseSchema.Type

/**
 * Schema for rename response (success + count).
 */
export const RenameResponseSchema = Schema.Struct({
  success: Schema.Boolean,
  count: Schema.Number,
})

/** Rename response type derived from schema. */
export type RenameResponse = typeof RenameResponseSchema.Type

/**
 * Schema for file data (content + SHA).
 */
export const FileDataSchema = Schema.Struct({
  content: Schema.String,
  sha: Schema.String,
})

/** File data type derived from schema. */
export type FileData = typeof FileDataSchema.Type

/**
 * Schema for a response containing only a SHA.
 */
export const ShaResponseSchema = Schema.Struct({
  sha: Schema.String,
})

/** SHA response type derived from schema. */
export type ShaResponse = typeof ShaResponseSchema.Type

/**
 * Schema for delete-file response (nested commit.sha).
 */
export const DeleteFileResponseSchema = Schema.Struct({
  commit: Schema.Struct({ sha: Schema.String }),
})

/** Delete file response type derived from schema. */
export type DeleteFileResponse = typeof DeleteFileResponseSchema.Type
