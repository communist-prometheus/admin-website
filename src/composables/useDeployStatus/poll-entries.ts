import { log } from '@/composables/useSWBridge/sw-log'
import type { JobStore } from './deploy-state'
import { fetchWorkflowJobs } from './workflow-api'
import { jobsAreFinal } from './workflow-constants'
import type { DeployBuild, WorkflowRun } from './workflow-types'

/**
 * Combine workflow runs with their cached jobs into display entries.
 * @param runs - Latest workflow runs from GitHub
 * @param store - Cache of jobs keyed by run id
 * @returns Entries for the home deploy list
 */
export const buildEntries = (
  runs: ReadonlyArray<WorkflowRun>,
  store: JobStore
): ReadonlyArray<DeployBuild> =>
  runs.map(run => ({ run, jobs: store[run.id] ?? [] }))

const needsJobs = (run: WorkflowRun, store: JobStore): boolean =>
  run.status !== 'completed' || !jobsAreFinal(store[run.id])

/**
 * Fetch jobs only for runs whose cached state is not yet final.
 * Completed runs with cached jobs are left alone.
 * @param runs - Runs to consider
 * @param store - Job store mutated in place
 */
export const fetchJobsFor = async (
  runs: ReadonlyArray<WorkflowRun>,
  store: JobStore
): Promise<void> => {
  const targets = runs.filter(r => needsJobs(r, store))
  if (targets.length === 0) return
  const results = await Promise.allSettled(
    targets.map(async r => {
      store[r.id] = await fetchWorkflowJobs(r.id)
    })
  )
  for (const r of results)
    if (r.status === 'rejected')
      log('warn', 'deploy-polling: job fetch failed', { reason: r.reason })
}

/**
 * True when every visible entry has a completed run AND its cached
 * jobs are all final. A bare completed run without cached jobs yet
 * returns false so the loop keeps polling until steps materialize.
 * @param entries - Current display entries
 * @returns True when the loop can safely pause
 */
export const allTerminal = (entries: ReadonlyArray<DeployBuild>): boolean =>
  entries.length > 0 &&
  entries.every(e => e.run.status === 'completed' && jobsAreFinal(e.jobs))
