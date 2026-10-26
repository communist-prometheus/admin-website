import { stringify } from 'yaml';
import { parseFrontmatter } from '@/sw/handlers/shared/frontmatter';

/**
 * The site's interface texts — menu items, shared button and link captions —
 * as the public site reads them: one `common/<group>/index.<lang>.md` per
 * language, each text a frontmatter key. A language without its file is not
 * an error to the site; it silently renders the default language instead,
 * which is how four languages went out with an English header.
 *
 * Pure: parsing, the table an editor sees, and the file written back.
 */

/** Texts of one language, keyed by the name the site looks them up by. */
export type Strings = Readonly<Record<string, string>>;

/** Texts of every language, keyed by language code. */
export type StringsByLang = Readonly<Record<string, Strings>>;

/** One language that lacks texts the table has. */
export interface MissingStrings {
  readonly lang: string;
  readonly keys: readonly string[];
}

/** File metadata that the site never shows. */
const META_KEYS: ReadonlySet<string> = new Set(['title', 'lang']);

/**
 * The texts a language file carries.
 * @param markdown - the file, or undefined when the language has none
 * @returns texts by key, in file order
 */
export const stringsOf = (markdown: string | undefined): Strings =>
  Object.fromEntries(
    Object.entries(parseFrontmatter(markdown ?? '').frontmatter).filter(
      (entry): entry is [string, string] => !META_KEYS.has(entry[0]) && typeof entry[1] === 'string',
    ),
  );

/**
 * The rows of the table: keys in the order of the first language that has
 * them (the default language comes first), then whatever only others carry.
 * @param byLang - texts per language
 * @param langs - languages in registry order
 * @returns ordered, de-duplicated keys
 */
export const stringKeys = (byLang: StringsByLang, langs: readonly string[]): readonly string[] => [
  ...new Set(langs.flatMap((lang) => Object.keys(byLang[lang] ?? {}))),
];

/**
 * The languages that lack some of the table's texts.
 * @param byLang - texts per language
 * @param langs - languages in registry order
 * @returns one entry per incomplete language
 */
export const missingStrings = (
  byLang: StringsByLang,
  langs: readonly string[],
): readonly MissingStrings[] => {
  const keys = stringKeys(byLang, langs);
  return langs
    .map((lang) => ({ lang, keys: keys.filter((key) => (byLang[lang]?.[key] ?? '') === '') }))
    .filter((entry) => entry.keys.length > 0);
};

/**
 * Sets one text. An emptied text is dropped, so the site falls back to the
 * default language instead of rendering a blank menu item.
 * @param byLang - texts per language
 * @param lang - language edited
 * @param key - text edited
 * @param value - new text
 * @returns a new table
 */
export const withString = (
  byLang: StringsByLang,
  lang: string,
  key: string,
  value: string,
): StringsByLang => {
  const rest = Object.fromEntries(Object.entries(byLang[lang] ?? {}).filter(([k]) => k !== key));
  return { ...byLang, [lang]: value.trim() === '' ? rest : { ...rest, [key]: value } };
};

/**
 * Whether two languages' texts say the same thing — the test for whether a
 * file needs writing at all. Compared by value, not by bytes: re-quoting an
 * unchanged file is still a commit that changes nothing.
 * @param a - texts before
 * @param b - texts after
 * @returns true when every key holds the same text
 */
export const sameStrings = (a: Strings, b: Strings): boolean =>
  Object.keys(a).length === Object.keys(b).length &&
  Object.entries(a).every(([key, value]) => b[key] === value);

/**
 * The language file to write: its own title kept (a new file takes the
 * fallback), the texts, and the language last, as the existing files have it.
 * @param previous - the current file, or undefined for a new language
 * @param lang - language of the file
 * @param strings - texts to store
 * @param fallbackTitle - title for a file that does not exist yet
 * @returns the full file
 */
export const renderStringsFile = (
  previous: string | undefined,
  lang: string,
  strings: Strings,
  fallbackTitle: string,
): string => {
  const title: unknown = parseFrontmatter(previous ?? '').frontmatter['title'];
  const record = { title: typeof title === 'string' ? title : fallbackTitle, ...strings, lang };
  return `---\n${stringify(record, { lineWidth: 0, blockQuote: false })}---\n`;
};
