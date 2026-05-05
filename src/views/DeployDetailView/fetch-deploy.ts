import {
  fetchWorkflowJobs,
  fetchWorkflowRuns,
} from '@/composables/useDeployStatus/workflow-api'
import type {
  WorkflowJob,
  WorkflowRun,
} from '@/composables/useDeployStatus/workflow-types'

/**
 * Pull the run + jobs for a single deploy id in parallel. The run
 * is matched out of the last 50 entries on the deploy workflow —
 * keeping the API calls to two regardless of how old the deploy is.
 * @param runId Workflow run id from the route.
 * @returns The matched run (or undefined) and its jobs.
 */
export const fetchDeploy = async (
  runId: number
): Promise<{
  readonly run: WorkflowRun | undefined
  readonly jobs: ReadonlyArray<WorkflowJob>
}> => {
  const [runs, jobs] = await Promise.all([
    fetchWorkflowRuns(50),
    fetchWorkflowJobs(runId),
  ])
  return { run: runs.find(r => r.id === runId), jobs }
}

/**
 * Coerce any caught throw into a string.
 * @param e Unknown thrown value.
 * @returns String message.
 */
export const errorMessage = (e: unknown): string =>
  e instanceof Error ? e.message : String(e)
