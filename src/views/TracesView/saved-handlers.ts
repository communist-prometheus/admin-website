import type { SearchFilters } from '@/composables/useTraceSearch/search-types'
import type { SavedQueriesHandle } from '@/composables/useTraceSearch/use-saved-queries'
import { buildLoad, buildSave } from './saved-prompt'

const noop = (): void => undefined

const buildRename =
  (saved: SavedQueriesHandle): ((name: string) => void) =>
  name => {
    const next =
      name.length === 0 ? null : globalThis.prompt('New name:', name)
    const apply =
      next === null || next.length === 0
        ? noop
        : () => saved.rename(name, next)
    apply()
  }

const buildRemove =
  (saved: SavedQueriesHandle): ((name: string) => void) =>
  name => {
    const apply = name.length === 0 ? noop : () => saved.remove(name)
    apply()
  }

/** Bound saved-queries handler trio used by the trace search view. */
export type SavedHandlers = {
  readonly save: () => void
  readonly load: (name: string) => void
  readonly rename: (name: string) => void
  readonly remove: (name: string) => void
}

/**
 * Build the four prompt-driven save / load / rename / remove
 * callbacks used by the trace-search saved-queries bar.
 * @param saved Reactive saved-queries store.
 * @param getFilters Lazy getter for the form's current filters.
 * @param setFilters Setter to repopulate the form on load.
 * @returns Handler trio.
 */
export const buildSavedHandlers = (
  saved: SavedQueriesHandle,
  getFilters: () => SearchFilters,
  setFilters: (next: SearchFilters) => void
): SavedHandlers => ({
  save: buildSave(saved, getFilters),
  load: buildLoad(saved, setFilters),
  rename: buildRename(saved),
  remove: buildRemove(saved),
})
