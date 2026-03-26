import { Schema } from 'effect'

/**
 * Schema for a single label entry with translation map.
 * Each entry has a key and translations per language code.
 */
export const LabelEntrySchema = Schema.Struct({
  key: Schema.String,
  translations: Schema.Record({
    key: Schema.String,
    value: Schema.String,
  }),
})

/** Label entry type derived from schema. */
export type LabelEntry = typeof LabelEntrySchema.Type

/**
 * Schema for an array of label entries.
 * Used to validate the parsed labels.json file.
 */
export const LabelArraySchema = Schema.Array(LabelEntrySchema)
