import type { ConflictRecord } from './conflicts-types'

const STORAGE_KEY = 'admin-conflicts'

const isObject = (x: unknown): x is Record<string, unknown> =>
  x !== null && typeof x === 'object'

const parse = (raw: string | null): ConflictRecord | undefined => {
  const parsed: unknown = raw === null ? undefined : JSON.parse(raw)
  return isObject(parsed)
    ? {
        sha: String(parsed['sha'] ?? ''),
        target: String(parsed['target'] ?? ''),
        files: Array.isArray(parsed['files'])
          ? parsed['files'].filter((f): f is string => typeof f === 'string')
          : [],
        at: Number(parsed['at'] ?? 0),
      }
    : undefined
}

/**
 * Read the persisted conflict record from `localStorage`. Returns
 * `undefined` when no record exists or the payload is malformed.
 * @returns Last persisted conflict, or undefined.
 */
export const loadConflict = (): ConflictRecord | undefined => {
  const raw = globalThis.localStorage?.getItem(STORAGE_KEY) ?? null
  return parse(raw)
}

/**
 * Persist the supplied conflict record so it survives reloads.
 * @param record Latest conflict payload from the SW.
 * @returns void
 */
export const saveConflict = (record: ConflictRecord): void => {
  globalThis.localStorage?.setItem(STORAGE_KEY, JSON.stringify(record))
}

/**
 * Clear the persisted conflict record. Called once the user
 * resolves or dismisses the conflict.
 * @returns void
 */
export const clearConflict = (): void => {
  globalThis.localStorage?.removeItem(STORAGE_KEY)
}
