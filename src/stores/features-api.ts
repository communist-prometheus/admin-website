import { swFetch } from '@/composables/useSWBridge/sw-fetch'
import { decodeResponse } from '@/validation/decode-response'
import type { FileData } from '@/validation/schemas/api-response'
import { FileDataSchema } from '@/validation/schemas/api-response'

const FEATURES_PATH = 'settings/features.json'

/** Shape of the persisted feature-flag JSON. */
export type FeatureFlags = {
  readonly webring: boolean
}

const DEFAULTS: FeatureFlags = {
  webring: false,
}

type PartialFlags = { readonly webring?: unknown }

const isObject = (x: unknown): x is PartialFlags =>
  x !== null && typeof x === 'object'

const asBool = (raw: unknown, fallback: boolean): boolean =>
  typeof raw === 'boolean' ? raw : fallback

/**
 * Parse the raw content of `settings/features.json` into the
 * canonical shape. Missing keys / malformed JSON fall back to
 * `DEFAULTS` (everything off) so the admin UI always renders.
 * @param content Raw file body from the SW.
 * @returns Parsed flags.
 */
export const parseFeatures = (content: string): FeatureFlags => {
  try {
    const value: unknown = JSON.parse(content)
    return isObject(value)
      ? { webring: asBool(value.webring, DEFAULTS.webring) }
      : DEFAULTS
  } catch {
    return DEFAULTS
  }
}

/**
 * Fetch the current `settings/features.json` content from the
 * content repo through the SW proxy. Returns undefined when the
 * file does not exist yet (first-time setup).
 * @returns File body + metadata, or undefined.
 */
export const fetchFeaturesFile = async (): Promise<FileData | undefined> => {
  const res = await swFetch(
    `/api/github/file?path=${encodeURIComponent(FEATURES_PATH)}`
  )
  return res.ok ? decodeResponse(FileDataSchema)(res) : undefined
}

/**
 * Persist a new flag set as a commit to the content repo. `sha`
 * comes from `fetchFeaturesFile` (undefined when creating).
 * @param next New feature flags.
 * @param sha Current file SHA for conflict detection (or undefined).
 * @returns SW response.
 */
export const saveFeaturesFile = async (
  next: FeatureFlags,
  sha: string | undefined
) =>
  swFetch('/api/github/file', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      path: FEATURES_PATH,
      content: `${JSON.stringify(next, null, 2)}\n`,
      sha,
      message: 'Update feature flags',
    }),
  })
