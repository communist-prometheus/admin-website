/**
 * Supported content languages.
 * Runtime values are loaded from settings/languages.json
 * via the settings store.
 * This constant provides a compile-time fallback.
 */
export const LANGUAGES = ['en', 'ru', 'it', 'es'] as const

/**
 * Language code type — string to support dynamic languages
 * from settings
 */
export type Language = string
