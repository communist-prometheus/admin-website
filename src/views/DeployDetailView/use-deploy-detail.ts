import { onMounted, ref } from 'vue'
import type {
  WorkflowJob,
  WorkflowRun,
} from '@/composables/useDeployStatus/workflow-types'
import { errorMessage, fetchDeploy } from './fetch-deploy'

interface DetailState {
  readonly run: WorkflowRun | undefined
  readonly jobs: ReadonlyArray<WorkflowJob>
  readonly loading: boolean
  readonly error: string | undefined
}

const INITIAL: DetailState = {
  run: undefined,
  jobs: [],
  loading: true,
  error: undefined,
}

const NOT_FOUND = 'Run not found in the last 50 deploys'

/**
 * Load the workflow run + jobs for a single deploy id. Polls a
 * single time on mount; for a live in-progress build the user
 * hits browser refresh — the home view's polling loop keeps the
 * list itself fresh.
 *
 * @param runId Workflow run id from the route.
 * @returns Reactive state object.
 */
export const useDeployDetail = (runId: number) => {
  const state = ref<DetailState>(INITIAL)

  const load = async (): Promise<void> => {
    try {
      const { run, jobs } = await fetchDeploy(runId)
      state.value = {
        run,
        jobs,
        loading: false,
        error: run ? undefined : NOT_FOUND,
      }
    } catch (e) {
      state.value = { ...state.value, loading: false, error: errorMessage(e) }
    }
  }

  onMounted(() => {
    void load()
  })
  return state
}
