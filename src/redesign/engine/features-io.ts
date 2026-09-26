import { publishFileViaApi, readFileViaApi } from './content.js';
import type { SaveResult } from './settings-io.js';

/**
 * Site feature flags (`settings/features.json`).
 *
 * Toggling them existed only in the client that is no longer served. A
 * missing file means every flag is off — a site that has never enabled
 * anything is not a failure to read.
 */

/** The flags the site understands. */
export interface FeatureFlags {
  /** Whether the site publishes the webring. */
  readonly webring: boolean;
}

const FEATURES_PATH = 'settings/features.json';

const DEFAULTS: FeatureFlags = { webring: false };

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== undefined && value !== null && !Array.isArray(value);

const flag = (value: unknown, fallback: boolean): boolean =>
  typeof value === 'boolean' ? value : fallback;

/**
 * Read the site's feature flags.
 * @returns The flags, with defaults for anything the file does not carry.
 */
export const readFeaturesViaApi = async (): Promise<FeatureFlags> => {
  const raw = await readFileViaApi(FEATURES_PATH);
  if (raw === undefined) return DEFAULTS;
  const parsed: unknown = JSON.parse(raw);
  if (!isRecord(parsed)) return DEFAULTS;
  return { webring: flag(parsed['webring'], DEFAULTS.webring) };
};

/**
 * Write the site's feature flags.
 * @param flags The flags to persist.
 * @returns Whether they were written, and why not when they were not.
 */
export const saveFeaturesViaApi = async (flags: FeatureFlags): Promise<SaveResult> => {
  const result = await publishFileViaApi(
    FEATURES_PATH,
    `${JSON.stringify(flags, undefined, 2)}\n`,
    `settings: флаги функций (вебринг ${flags.webring ? 'вкл' : 'выкл'})`,
  );
  return result.ok ? { ok: true } : { ok: false, error: result.error ?? 'Не удалось сохранить флаги.' };
};
