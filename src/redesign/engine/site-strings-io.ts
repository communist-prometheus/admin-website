import { publishFileViaApi, readContentFile } from './content.js';
import type { SaveResult } from './settings-io.js';
import { renderStringsFile, sameStrings, stringsOf, type StringsByLang } from './site-strings.js';

/**
 * Reading and writing the site's interface texts (`common/menu`,
 * `common/labels`) over the GitHub API, one file per language.
 */

/** Which interface file set: the navigation, or the shared captions. */
export type StringsGroup = 'menu' | 'labels';

/** The current file of each language; undefined where it does not exist. */
export type StringsFiles = Readonly<Record<string, string | undefined>>;

/** The outcome of a save, with the files it actually wrote. */
export interface StringsSaveResult extends SaveResult {
  readonly written: readonly string[];
}

/**
 * Where a language's file of a group lives.
 * @param group - file set
 * @param lang - language code
 * @returns repo-relative path
 */
export const stringsPath = (group: StringsGroup, lang: string): string =>
  `common/${group}/index.${lang}.md`;

/**
 * Reads every language's file of a group. A missing file is a language not
 * translated yet; any other failure throws, so an expired token can never pass
 * for "nothing is translated" and invite an editor to overwrite real texts.
 * @param group - file set
 * @param langs - languages the site publishes in
 * @returns files by language
 */
export const readStringsFilesViaApi = async (
  group: StringsGroup,
  langs: readonly string[],
): Promise<StringsFiles> => {
  const reads = await Promise.all(langs.map((lang) => readContentFile(stringsPath(group, lang))));
  const failed = reads.find((read) => read.kind === 'error');
  if (failed?.kind === 'error') throw new Error(`Не удалось прочитать ${group}: ${failed.error}`);
  return Object.fromEntries(
    reads.map((read, i) => [langs[i] ?? '', read.kind === 'ok' ? read.text : undefined]),
  );
};

/**
 * Writes back the languages whose texts changed — and only those: a file that
 * says the same thing is never re-committed. Stops at the first refusal.
 * @param group - file set
 * @param files - the files as they were read
 * @param byLang - the edited texts
 * @param langs - languages the site publishes in
 * @param fallbackTitle - title for a language file created now
 * @returns what was written, or why the save stopped
 */
export const saveStringsViaApi = async (
  group: StringsGroup,
  files: StringsFiles,
  byLang: StringsByLang,
  langs: readonly string[],
  fallbackTitle: string,
): Promise<StringsSaveResult> => {
  const changed = langs.filter((lang) => !sameStrings(stringsOf(files[lang]), byLang[lang] ?? {}));
  const written: string[] = [];
  for (const lang of changed) {
    const path = stringsPath(group, lang);
    const text = renderStringsFile(files[lang], lang, byLang[lang] ?? {}, fallbackTitle);
    const result = await publishFileViaApi(path, text, `common: ${group} (${lang})`);
    if (!result.ok) return { ok: false, error: result.error ?? `Не удалось сохранить ${path}.`, written };
    written.push(path);
  }
  return { ok: true, written };
};
