import type { SearchFilters } from '@/composables/useTraceSearch/search-types'
import type { SavedQueriesHandle } from '@/composables/useTraceSearch/use-saved-queries'

const noop = (): void => undefined

/**
 * Prompt-driven save: asks the user for a name, then stores
 * the current filters under that name. No-op on empty name.
 * @param saved Reactive saved-queries store.
 * @param getFilters Lazy getter for the form's current filters.
 * @returns Click handler.
 */
export const buildSave =
  (
    saved: SavedQueriesHandle,
    getFilters: () => SearchFilters
  ): (() => void) =>
  () => {
    const name = globalThis.prompt('Save query as:')
    const apply =
      name === null || name.length === 0
        ? noop
        : () => saved.save(name, getFilters())
    apply()
  }

/**
 * Recall a saved query into the form. No-op when the name is
 * unknown (defensive against stale dropdown values).
 * @param saved Reactive saved-queries store.
 * @param setFilters Setter to repopulate the form.
 * @returns Change handler accepting the picked name.
 */
export const buildLoad =
  (
    saved: SavedQueriesHandle,
    setFilters: (next: SearchFilters) => void
  ): ((name: string) => void) =>
  name => {
    const found = saved.queries.value.find(q => q.name === name)
    const apply =
      found === undefined ? noop : () => setFilters({ ...found.filters })
    apply()
  }
