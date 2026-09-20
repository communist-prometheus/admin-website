import { publishFileViaApi, readFileViaApi, type Localized } from './content.js';
import type { SaveResult } from './settings-io.js';

/**
 * The site's own settings: which languages it publishes in
 * (`settings/languages.json`) and the curated links directory
 * (`settings/links.json`).
 *
 * Both could only be EDITED in the previous client — the rebuilt admin
 * showed languages read-only and had no links surface at all. They move here
 * onto the same Contents-API pattern the taxonomies use, so retiring that
 * client removes code rather than capability.
 *
 * Validation is refusal, not repair: a languages file with a duplicated code
 * makes one entry unreachable, and a links entry filed under a group that
 * does not exist simply never renders. Writing either would produce a file
 * that looks saved and behaves broken.
 */

/** One language the site publishes in. */
export interface SiteLanguageEntry {
  readonly code: string;
  readonly label: string;
}

/** One entry of the curated links directory. */
export interface LinkEntry {
  readonly url: string;
  readonly name: string;
  readonly category: string;
  readonly inRing: boolean;
  readonly descriptions: Localized;
}

/** The links directory: its groups, and the entries filed under them. */
export interface LinksDocument {
  readonly groups: readonly string[];
  readonly entries: readonly LinkEntry[];
}

const LANGUAGES_PATH = 'settings/languages.json';
const LINKS_PATH = 'settings/links.json';

/** A language code as the site uses them: two or three lowercase letters. */
const LANG_CODE = /^[a-z]{2,3}$/;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const str = (value: unknown): string => (typeof value === 'string' ? value : '');

const localized = (value: unknown): Localized => {
  if (!isRecord(value)) return {};
  return Object.fromEntries(
    Object.entries(value).filter((e): e is [string, string] => typeof e[1] === 'string'),
  );
};

const pretty = (value: unknown): string => `${JSON.stringify(value, undefined, 2)}\n`;

const refuse = (error: string): SaveResult => ({ ok: false, error });

/**
 * Read the languages the site publishes in.
 * @returns The entries, in file order.
 * @throws When the file cannot be read — an unreadable file must not look
 *   like a site with no languages.
 */
export const readLanguagesViaApi = async (): Promise<readonly SiteLanguageEntry[]> => {
  const raw = await readFileViaApi(LANGUAGES_PATH);
  if (raw === undefined) throw new Error(`Не удалось прочитать ${LANGUAGES_PATH}.`);
  const parsed: unknown = JSON.parse(raw);
  if (!Array.isArray(parsed)) throw new Error(`${LANGUAGES_PATH}: ожидался список.`);
  return parsed
    .filter(isRecord)
    .filter((entry) => str(entry['code']) !== '')
    .map((entry) => ({ code: str(entry['code']), label: str(entry['label']) }));
};

/** Why a languages list cannot be written, or undefined when it can. */
const languagesProblem = (
  entries: readonly SiteLanguageEntry[],
): string | undefined => {
  if (entries.length === 0) return 'Нужен хотя бы один язык — сайт должен на чём-то выходить.';
  const seen = new Set<string>();
  for (const entry of entries) {
    if (!LANG_CODE.test(entry.code))
      return `«${entry.code}» — не код языка (ожидается ru, en, it…).`;
    if (entry.label.trim() === '') return `У языка «${entry.code}» нет названия.`;
    if (seen.has(entry.code)) return `Язык «${entry.code}» указан дважды.`;
    seen.add(entry.code);
  }
  return undefined;
};

/**
 * Write the languages list back.
 * @param entries The list to persist.
 * @returns Whether it was written, and why not when it was not.
 */
export const saveLanguagesViaApi = async (
  entries: readonly SiteLanguageEntry[],
): Promise<SaveResult> => {
  const problem = languagesProblem(entries);
  if (problem !== undefined) return refuse(problem);
  const result = await publishFileViaApi(
    LANGUAGES_PATH,
    pretty(entries),
    `settings: языки сайта (${entries.length})`,
  );
  return result.ok ? { ok: true } : refuse(result.error ?? 'Не удалось сохранить языки.');
};

const toLink = (value: unknown): LinkEntry | undefined => {
  if (!isRecord(value) || str(value['url']) === '') return undefined;
  return {
    url: str(value['url']),
    name: str(value['name']),
    category: str(value['category']),
    inRing: value['inRing'] === true,
    descriptions: localized(value['descriptions']),
  };
};

/**
 * Read the curated links directory. A missing file is an empty directory —
 * the repository simply has no links yet, which is not a failure.
 * @returns Groups and entries.
 */
export const readLinksViaApi = async (): Promise<LinksDocument> => {
  const raw = await readFileViaApi(LINKS_PATH);
  if (raw === undefined) return { groups: [], entries: [] };
  const parsed: unknown = JSON.parse(raw);
  if (!isRecord(parsed)) return { groups: [], entries: [] };
  const groups = Array.isArray(parsed['groups'])
    ? parsed['groups'].filter((g): g is string => typeof g === 'string')
    : [];
  const entries = Array.isArray(parsed['entries'])
    ? parsed['entries'].map(toLink).filter((e): e is LinkEntry => e !== undefined)
    : [];
  return { groups, entries };
};

const isUrl = (value: string): boolean => {
  try {
    const parsed = new URL(value);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
};

/**
 * Why a links document cannot be written, or undefined when it can.
 *
 * A section is whatever the entries are filed under — not a list that has to
 * exist first. The opposite rule made the first link unaddable: a repository
 * with no `links.json` has no sections, so every category was "a section that
 * does not exist" and nothing could ever be saved.
 */
const linksProblem = (doc: LinksDocument): string | undefined => {
  const seen = new Set<string>();
  for (const entry of doc.entries) {
    if (entry.url.trim() === '') return `У ссылки «${entry.name}» нет адреса.`;
    if (!isUrl(entry.url)) return `«${entry.url}» — не адрес (нужен http:// или https://).`;
    if (entry.category.trim() === '') return `Ссылка «${entry.name}» не отнесена к разделу.`;
    if (seen.has(entry.url)) return `Адрес «${entry.url}» указан дважды.`;
    seen.add(entry.url);
  }
  return undefined;
};

/**
 * The sections a document publishes: those it already declared, in order,
 * followed by any a newly-filed entry introduced. Derived rather than
 * maintained by hand, so a section can never go missing under its entries.
 * @param doc The document being written.
 * @returns Ordered, de-duplicated section names.
 */
export const linkGroupsOf = (doc: LinksDocument): readonly string[] => [
  ...new Set([...doc.groups, ...doc.entries.map((e) => e.category)].filter((g) => g !== '')),
];

/**
 * Write the links directory back whole.
 * @param doc Groups and entries to persist.
 * @returns Whether it was written, and why not when it was not.
 */
export const saveLinksViaApi = async (doc: LinksDocument): Promise<SaveResult> => {
  const problem = linksProblem(doc);
  if (problem !== undefined) return refuse(problem);
  const result = await publishFileViaApi(
    LINKS_PATH,
    pretty({ groups: linkGroupsOf(doc), entries: doc.entries }),
    `settings: ссылки (${doc.entries.length})`,
  );
  return result.ok ? { ok: true } : refuse(result.error ?? 'Не удалось сохранить ссылки.');
};
