import { Schema } from 'effect'

/**
 * Schema for a single editorial topic entry.
 * A topic has a key, a single colour, and localized name + subtitle
 * (приписка) maps keyed by language code.
 */
export const TopicEntrySchema = Schema.Struct({
  key: Schema.String,
  color: Schema.String,
  name: Schema.Record({
    key: Schema.String,
    value: Schema.String,
  }),
  subtitle: Schema.Record({
    key: Schema.String,
    value: Schema.String,
  }),
})

/** Topic entry type derived from schema. */
export type TopicEntry = typeof TopicEntrySchema.Type

/**
 * Schema for an array of topic entries.
 * Used to validate the parsed topics.json file.
 */
export const TopicArraySchema = Schema.Array(TopicEntrySchema)
