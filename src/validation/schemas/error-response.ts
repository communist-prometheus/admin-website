import { Schema } from 'effect'

/**
 * Schema for API error response body.
 * Used to extract error messages from non-ok responses.
 */
export const ErrorResponseSchema = Schema.Struct({
  error: Schema.optional(Schema.String),
})

/** Error response type derived from schema. */
export type ErrorResponse = typeof ErrorResponseSchema.Type
