import { Schema } from 'effect'

/**
 * Schema for Service Worker git configuration.
 * Persisted to IndexedDB for SW restart recovery.
 */
export const SWGitConfigSchema = Schema.Struct({
  owner: Schema.String,
  repo: Schema.String,
  branch: Schema.String,
  contentPath: Schema.String,
  corsProxy: Schema.String,
  token: Schema.String,
  authorName: Schema.optional(Schema.String),
  authorEmail: Schema.optional(Schema.String),
  mock: Schema.optional(Schema.Boolean),
})

/** SWGitConfig type derived from schema. */
export type SWGitConfig = typeof SWGitConfigSchema.Type
