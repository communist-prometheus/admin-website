import { ref } from 'vue'
import type { RunLog } from '@/validation/schemas/run-log'
import {
  createLoadMoreRuns,
  createLoadRuns,
  type RunsRefs,
} from './runs-actions'

/**
 * Reactive state + actions for the comms run-history surface.
 * Mirrors the comms / schedule factory shape.
 * @returns Refs + the `load` / `loadMore` actions.
 */
export const createRunsState = () => {
  const r: RunsRefs = {
    runs: ref<readonly RunLog[]>([]),
    loading: ref(false),
    loaded: ref(false),
    error: ref<string | undefined>(undefined),
    hasMore: ref(false),
  }
  return { ...r, load: createLoadRuns(r), loadMore: createLoadMoreRuns(r) }
}
