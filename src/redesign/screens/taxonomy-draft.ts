import type { Label, Topic } from '../engine/settings-io.js';

/**
 * Pure edits on a taxonomy draft — the list a screen holds while the editor
 * works on it, before it is committed. Kept out of the components so the rules
 * (never mutate, always replace) are testable on their own.
 */

/** A blank topic row, ready for the editor to name. */
export const emptyTopic = (): Topic => ({
  key: '',
  color: '#888888',
  name: {},
  subtitle: {},
  description: {},
});

/** A blank category row. */
export const emptyLabel = (): Label => ({ key: '', translations: {} });

/** Replaces the entry at `index` with the result of `change`. */
const replaceAt = <T>(draft: readonly T[], index: number, change: (entry: T) => T): readonly T[] =>
  draft.map((entry, i) => (i === index ? change(entry) : entry));

/**
 * Sets one entry's key.
 * @param draft - current draft list
 * @param index - row being edited
 * @param key - new key
 * @returns a new list
 */
export const withKey = <T extends { readonly key: string }>(
  draft: readonly T[],
  index: number,
  key: string,
): readonly T[] => replaceAt(draft, index, (entry) => ({ ...entry, key }));

/**
 * Sets one topic's colour.
 * @param draft - current draft list
 * @param index - row being edited
 * @param color - new colour
 * @returns a new list
 */
export const withColor = (draft: readonly Topic[], index: number, color: string): readonly Topic[] =>
  replaceAt(draft, index, (topic) => ({ ...topic, color }));

/**
 * Sets one entry's text for a language. An emptied field is dropped rather than
 * stored as an empty string, so the site falls back to another language instead
 * of rendering a blank plaque.
 * @param draft - current draft list
 * @param index - row being edited
 * @param field - which localized map to touch
 * @param lang - language code
 * @param value - new text
 * @returns a new list
 */
export const withText = <T>(
  draft: readonly T[],
  index: number,
  field: keyof T & string,
  lang: string,
  value: string,
): readonly T[] =>
  replaceAt(draft, index, (entry) => {
    const current: unknown = Reflect.get(entry as object, field);
    const pairs = typeof current === 'object' && current !== undefined ? Object.entries({ ...current }) : [];
    const kept = pairs.filter((pair): pair is [string, string] => typeof pair[1] === 'string');
    const map = Object.fromEntries(kept.filter(([code]) => code !== lang));
    const next = value.trim() === '' ? map : { ...map, [lang]: value };
    return { ...entry, [field]: next };
  });

/**
 * Drops the entry at `index`.
 * @param draft - current draft list
 * @param index - row to remove
 * @returns a new list
 */
export const withoutAt = <T>(draft: readonly T[], index: number): readonly T[] =>
  draft.filter((_, i) => i !== index);
