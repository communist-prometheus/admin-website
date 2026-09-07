import { publishFileViaApi, readFileViaApi, type Localized } from './content.js';

/**
 * Reading and writing the content repository's settings files over the GitHub
 * API — the taxonomies an editor has to be able to manage: topics
 * (`settings/topics.json`, the coloured plaque on an article) and categories
 * (`settings/labels.json`, the rubric shown on cards and in the blog filter).
 *
 * The API, not the Service-Worker git engine: the topics screen used to read
 * through the SW, which needs a full repository clone, and sat on its loading
 * placeholder forever whenever that clone had not completed.
 */

/** One editorial topic: a stable key, a colour and per-language text. */
export interface Topic {
  readonly key: string;
  readonly color: string;
  readonly name: Localized;
  readonly subtitle?: Localized;
  readonly description?: Localized;
}

/** One category (rubric): a stable key with per-language display text. */
export interface Label {
  readonly key: string;
  readonly translations: Localized;
}

/** The outcome of a settings write. */
export interface SaveResult {
  readonly ok: boolean;
  readonly error?: string;
}

const TOPICS_PATH = 'settings/topics.json';
const LABELS_PATH = 'settings/labels.json';

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const localized = (value: unknown): Localized => {
  if (!isRecord(value)) return {};
  return Object.fromEntries(
    Object.entries(value).filter((entry): entry is [string, string] => typeof entry[1] === 'string'),
  );
};

const toTopic = (value: unknown): Topic | undefined => {
  if (!isRecord(value) || typeof value['key'] !== 'string') return undefined;
  return {
    key: value['key'],
    color: typeof value['color'] === 'string' ? value['color'] : '#888888',
    name: localized(value['name']),
    subtitle: localized(value['subtitle']),
    description: localized(value['description']),
  };
};

const toLabel = (value: unknown): Label | undefined => {
  if (!isRecord(value) || typeof value['key'] !== 'string') return undefined;
  return { key: value['key'], translations: localized(value['translations']) };
};

/**
 * Reads one settings array. Throws when the file cannot be read, so a screen
 * can say "could not load" instead of rendering an empty list that looks like
 * a repository with no topics in it.
 */
const readSettingsArray = async <T>(
  path: string,
  parse: (value: unknown) => T | undefined,
): Promise<readonly T[]> => {
  const raw = await readFileViaApi(path);
  if (raw === undefined) throw new Error(`Не удалось прочитать ${path}.`);
  const parsed: unknown = JSON.parse(raw);
  if (!Array.isArray(parsed)) throw new Error(`${path}: ожидался список.`);
  return parsed.map(parse).filter((entry): entry is T => entry !== undefined);
};

/** The repository's editorial topics. Throws when the file cannot be read. */
export const readTopicsViaApi = async (): Promise<readonly Topic[]> =>
  readSettingsArray(TOPICS_PATH, toTopic);

/** The repository's categories. Throws when the file cannot be read. */
export const readLabelsViaApi = async (): Promise<readonly Label[]> =>
  readSettingsArray(LABELS_PATH, toLabel);

/**
 * Refuses a list that would break the site: an entry without a key is
 * unreferenceable, and a duplicate key silently shadows the earlier one.
 */
const keyProblem = (entries: readonly { readonly key: string }[]): string | undefined => {
  const seen = new Set<string>();
  for (const entry of entries) {
    const key = entry.key.trim();
    if (key === '') return 'У каждой записи должен быть ключ.';
    if (seen.has(key)) return `Ключ «${key}» повторяется — ключи должны быть уникальными.`;
    seen.add(key);
  }
  return undefined;
};

/** Settings are committed as readable JSON so a diff stays reviewable. */
const toJson = (value: unknown): string => `${JSON.stringify(value, undefined, 2)}\n`;

const saveSettings = async (
  path: string,
  entries: readonly { readonly key: string }[],
  message: string,
): Promise<SaveResult> => {
  const problem = keyProblem(entries);
  if (problem !== undefined) return { ok: false, error: problem };
  const result = await publishFileViaApi(path, toJson(entries), message);
  return result.ok ? { ok: true } : { ok: false, error: result.error };
};

/**
 * Commits the topic list.
 * @param topics - the full list, in the order it should be stored
 * @returns ok, or the reason the write was refused
 */
export const saveTopicsViaApi = async (topics: readonly Topic[]): Promise<SaveResult> =>
  saveSettings(TOPICS_PATH, topics, `settings: темы (${topics.length})`);

/**
 * Commits the category list.
 * @param labels - the full list, in the order it should be stored
 * @returns ok, or the reason the write was refused
 */
export const saveLabelsViaApi = async (labels: readonly Label[]): Promise<SaveResult> =>
  saveSettings(LABELS_PATH, labels, `settings: рубрики (${labels.length})`);
