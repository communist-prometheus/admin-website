import type { Ref } from 'vue'
import { fetchSearch } from './fetch-search'
import type { SearchFilters, TraceSummary } from './search-types'

/** Mutable state owned by `useTraceSearch`. */
export type SearchState = {
  readonly filters: Ref<SearchFilters>
  readonly traces: Ref<ReadonlyArray<TraceSummary>>
  readonly nextCursor: Ref<number | undefined>
  readonly loading: Ref<boolean>
  readonly error: Ref<boolean>
}

/**
 * Run a search with the current filters at the given cursor and
 * fold the response into the reactive state. New cursor (`undefined`)
 * replaces; subsequent cursors append.
 * @param state Reactive search state.
 * @param cursor Optional `started_at` cursor for paging.
 * @returns Promise resolving once the state is updated.
 */
export const applySearch = async (
  state: SearchState,
  cursor: number | undefined
): Promise<void> => {
  state.loading.value = true
  state.error.value = false
  const { response, error } = await fetchSearch(state.filters.value, cursor)
  const merge =
    cursor === undefined
      ? () => {
          state.traces.value = response.traces
        }
      : () => {
          state.traces.value = [...state.traces.value, ...response.traces]
        }
  merge()
  state.nextCursor.value = response.nextCursor
  state.error.value = error
  state.loading.value = false
}
