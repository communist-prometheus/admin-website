import { Schema } from 'effect'

/**
 * Schema for a single language entry in settings.
 * Validates code (ISO-like) and human-readable label.
 */
export const LanguageEntrySchema = Schema.Struct({
  code: Schema.String,
  label: Schema.String,
})

/** Language entry type derived from schema. */
export type LanguageEntry = typeof LanguageEntrySchema.Type

/**
 * Schema for an array of language entries.
 * Used to validate the parsed languages.json file.
 */
export const LanguageArraySchema = Schema.Array(LanguageEntrySchema)
