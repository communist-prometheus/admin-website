import { Schema } from 'effect'

/**
 * Schema for cached user profile in localStorage.
 * Validates username, name, and avatar URL strings.
 */
export const CachedProfileSchema = Schema.Struct({
  username: Schema.String,
  name: Schema.String,
  avatar: Schema.String,
})

/** Cached user profile type derived from schema. */
export type CachedProfile = typeof CachedProfileSchema.Type

/**
 * Schema for GitHub API /user response fields.
 * Maps API snake_case to our domain model.
 */
export const GitHubUserApiSchema = Schema.Struct({
  login: Schema.String,
  name: Schema.NullOr(Schema.String),
  avatar_url: Schema.String,
})

/** GitHub user API response type. */
export type GitHubUserApi = typeof GitHubUserApiSchema.Type
