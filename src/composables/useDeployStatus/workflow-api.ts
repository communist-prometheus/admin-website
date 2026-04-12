import { ghFetch } from './gh-fetch'
import type { WorkflowJob, WorkflowRun } from './workflow-types'

const REPO = 'communist-prometheus/public-website'
const WORKFLOW = 'deploy.yml'

interface RunsResponse {
  readonly workflow_runs: ReadonlyArray<WorkflowRun>
}

interface JobsResponse {
  readonly jobs: ReadonlyArray<WorkflowJob>
}

/**
 * Fetch recent workflow runs for the deploy workflow.
 * @param count - Number of runs to fetch
 * @returns Workflow runs sorted by creation date
 */
export const fetchWorkflowRuns = async (
  count = 15
): Promise<ReadonlyArray<WorkflowRun>> => {
  const data = await ghFetch<RunsResponse>(
    `/repos/${REPO}/actions/workflows/${WORKFLOW}/runs?per_page=${count}`
  )
  return data?.workflow_runs ?? []
}

/**
 * Fetch jobs for a specific workflow run.
 * @param runId - Workflow run ID
 * @returns Jobs with step details
 */
export const fetchWorkflowJobs = async (
  runId: number
): Promise<ReadonlyArray<WorkflowJob>> => {
  const data = await ghFetch<JobsResponse>(
    `/repos/${REPO}/actions/runs/${runId}/jobs`
  )
  return data?.jobs ?? []
}
