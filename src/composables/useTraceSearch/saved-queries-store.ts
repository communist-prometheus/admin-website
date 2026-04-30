import type { SearchFilters } from './search-types'

const STORAGE_KEY = 'trace-saved-queries'

/** A named filter set the user has stashed for reuse. */
export type SavedQuery = {
  readonly name: string
  readonly filters: SearchFilters
}

const isObject = (v: unknown): v is Record<string, unknown> =>
  v !== null && typeof v === 'object'

const isFilters = (v: unknown): v is SearchFilters =>
  isObject(v) && typeof v['q'] === 'string'

const isQuery = (v: unknown): v is SavedQuery =>
  isObject(v) && typeof v['name'] === 'string' && isFilters(v['filters'])

const tryParse = (raw: string): ReadonlyArray<SavedQuery> => {
  try {
    const parsed: unknown = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed.filter(isQuery) : []
  } catch {
    return []
  }
}

const safeParse = (raw: string | null): ReadonlyArray<SavedQuery> =>
  raw === null || raw.length === 0 ? [] : tryParse(raw)

/**
 * Read the persisted saved-query list from localStorage.
 * Tolerates missing / malformed storage so the form never
 * crashes on first load.
 * @returns Frozen list of saved queries.
 */
export const loadSavedQueries = (): ReadonlyArray<SavedQuery> =>
  safeParse(globalThis.localStorage?.getItem(STORAGE_KEY) ?? null)

/**
 * Persist the saved-query list. No-op when localStorage is
 * unavailable (SSR / locked-down browsers).
 * @param queries List to persist.
 * @returns void
 */
export const writeSavedQueries = (
  queries: ReadonlyArray<SavedQuery>
): void => {
  globalThis.localStorage?.setItem(STORAGE_KEY, JSON.stringify(queries))
}
