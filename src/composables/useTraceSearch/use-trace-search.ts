import { type Ref, ref } from 'vue'
import { applySearch, type SearchState } from './search-state'
import {
  emptyFilters,
  type SearchFilters,
  type TraceSummary,
} from './search-types'

/** Reactive surface returned by `useTraceSearch`. */
export type TraceSearchHandle = {
  readonly filters: Ref<SearchFilters>
  readonly traces: Ref<ReadonlyArray<TraceSummary>>
  readonly nextCursor: Ref<number | undefined>
  readonly loading: Ref<boolean>
  readonly error: Ref<boolean>
  readonly run: () => Promise<void>
  readonly loadMore: () => Promise<void>
  readonly reset: () => void
}

const buildState = (): SearchState => ({
  filters: ref<SearchFilters>({ ...emptyFilters }),
  traces: ref<ReadonlyArray<TraceSummary>>([]),
  nextCursor: ref<number | undefined>(undefined),
  loading: ref(false),
  error: ref(false),
})

const buildReset =
  (state: SearchState): (() => void) =>
  () => {
    state.filters.value = { ...emptyFilters }
    state.traces.value = []
    state.nextCursor.value = undefined
    state.error.value = false
  }

/**
 * Drive the trace search form: holds the active filters,
 * issues `fetch(/v1/traces)` calls, and exposes pagination
 * helpers. Errors surface as a flag — callers render a banner
 * / retry button rather than throwing.
 * @returns Reactive filters, results, and action handlers.
 */
export const useTraceSearch = (): TraceSearchHandle => {
  const state = buildState()
  return {
    ...state,
    run: () => applySearch(state, undefined),
    loadMore: () =>
      state.nextCursor.value === undefined
        ? Promise.resolve()
        : applySearch(state, state.nextCursor.value),
    reset: buildReset(state),
  }
}
