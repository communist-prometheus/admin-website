import type { Lang } from '@/validation/schemas/subscriber'

/** Human-readable endonym for each supported language code. */
export const LANG_LABELS: Readonly<Record<Lang, string>> = {
  en: 'English',
  ru: 'Русский',
  it: 'Italiano',
  es: 'Español',
  uk: 'Українська',
  pl: 'Polski',
  bl: 'Беларуская',
}

/**
 * Resolve a language code to its display label.
 * @param lang Language code.
 * @returns The endonym, falling back to the raw code.
 */
export const langLabel = (lang: Lang): string => LANG_LABELS[lang] ?? lang
