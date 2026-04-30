import { type Ref, ref } from 'vue'
import {
  loadSavedQueries,
  type SavedQuery,
  writeSavedQueries,
} from './saved-queries-store'
import type { SearchFilters } from './search-types'

const replaceByName = (
  list: ReadonlyArray<SavedQuery>,
  next: SavedQuery
): ReadonlyArray<SavedQuery> => {
  const without = list.filter(q => q.name !== next.name)
  return [...without, next]
}

/** Reactive surface returned by `useSavedQueries`. */
export type SavedQueriesHandle = {
  readonly queries: Ref<ReadonlyArray<SavedQuery>>
  readonly save: (name: string, filters: SearchFilters) => void
  readonly rename: (oldName: string, newName: string) => void
  readonly remove: (name: string) => void
}

const persist = (
  queries: Ref<ReadonlyArray<SavedQuery>>,
  next: ReadonlyArray<SavedQuery>
): void => {
  queries.value = next
  writeSavedQueries(next)
}

/**
 * Reactive store for the trace-search saved-queries list.
 * Persists every mutation to localStorage; tolerates missing
 * / malformed storage on first load.
 * @returns Reactive list + save / rename / remove handlers.
 */
export const useSavedQueries = (): SavedQueriesHandle => {
  const queries = ref<ReadonlyArray<SavedQuery>>(loadSavedQueries())
  return {
    queries,
    save: (name, filters) =>
      persist(queries, replaceByName(queries.value, { name, filters })),
    rename: (oldName, newName) =>
      persist(
        queries,
        queries.value.map(q =>
          q.name === oldName ? { ...q, name: newName } : q
        )
      ),
    remove: name =>
      persist(
        queries,
        queries.value.filter(q => q.name !== name)
      ),
  }
}
