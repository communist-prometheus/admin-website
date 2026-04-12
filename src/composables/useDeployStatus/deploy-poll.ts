import type { DeployState, JobStore } from './deploy-state'
import { fetchWorkflowJobs, fetchWorkflowRuns } from './workflow-api'
import { jobsAreFinal } from './workflow-constants'
import type { DeployBuild, WorkflowRun } from './workflow-types'

const RUNS_LIMIT = 15

const buildEntries = (
  runs: ReadonlyArray<WorkflowRun>,
  store: JobStore
): ReadonlyArray<DeployBuild> =>
  runs.map(run => ({ run, jobs: store[run.id] ?? [] }))

const fetchActiveJobs = async (
  runs: ReadonlyArray<WorkflowRun>,
  store: JobStore
): Promise<void> => {
  const target = runs.find(r => !jobsAreFinal(store[r.id]))
  if (!target) return
  store[target.id] = await fetchWorkflowJobs(target.id)
}

/**
 * Fast poll — refetch runs and active jobs.
 * @param state - Deploy state to mutate with fresh data
 * @returns Resolves once the poll tick completes
 */
export const doFastPoll = async (state: DeployState): Promise<void> => {
  try {
    const runs = await fetchWorkflowRuns(RUNS_LIMIT)
    await fetchActiveJobs(runs, state.store)
    state.entries.value = buildEntries(runs, state.store)
    state.error.value = undefined
  } catch (e) {
    state.error.value = e instanceof Error ? e.message : 'Failed to fetch'
  } finally {
    state.loading.value = false
  }
}

/**
 * Slow poll — refetch jobs for the first still-running entry.
 * @param state - Deploy state holding the cached entries
 * @returns Resolves once the poll tick completes
 */
export const doSlowPoll = async (state: DeployState): Promise<void> => {
  const target = state.entries.value.find(
    e => !jobsAreFinal(state.store[e.run.id])
  )
  if (!target) return
  try {
    state.store[target.run.id] = await fetchWorkflowJobs(target.run.id)
    const runs = state.entries.value.map(e => e.run)
    state.entries.value = buildEntries(runs, state.store)
  } catch {
    /* silent */
  }
}
