import { Schema } from 'effect'

/**
 * Schema for a successful OAuth popup message.
 */
export const OAuthSuccessSchema = Schema.Struct({
  type: Schema.Literal('github-oauth-success'),
  token: Schema.String,
})

/**
 * Schema for a failed OAuth popup message.
 */
export const OAuthErrorSchema = Schema.Struct({
  type: Schema.Literal('github-oauth-error'),
  error: Schema.optional(Schema.String),
})

/**
 * Union schema for all OAuth popup messages.
 * Discriminated by the `type` field.
 */
export const OAuthMessageSchema = Schema.Union(
  OAuthSuccessSchema,
  OAuthErrorSchema
)

/** OAuth message type derived from schema. */
export type OAuthMessage = typeof OAuthMessageSchema.Type
