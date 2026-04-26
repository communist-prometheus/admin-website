import { Schema } from 'effect'

/**
 * Schema for a successful OAuth popup message that carries an
 * already-exchanged token. Sent by the callback when popup and opener
 * share the same origin, so the callback could load the PKCE verifier
 * from its own localStorage.
 */
export const OAuthSuccessSchema = Schema.Struct({
  type: Schema.Literal('github-oauth-success'),
  token: Schema.String,
})

/**
 * Schema for a callback-side message that hands the GitHub auth code
 * back to the opener. Used when the popup runs on a different origin
 * than the opener (e.g. opener on dev-admin.comprom.org, popup on
 * admin.comprom.org via VITE_OAUTH_REDIRECT_URI). The PKCE verifier
 * lives in the opener's localStorage; the opener exchanges the code
 * itself.
 */
export const OAuthCodeSchema = Schema.Struct({
  type: Schema.Literal('github-oauth-code'),
  code: Schema.String,
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
  OAuthCodeSchema,
  OAuthErrorSchema
)

/** OAuth message type derived from schema. */
export type OAuthMessage = typeof OAuthMessageSchema.Type
