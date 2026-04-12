import type { WorkflowJob } from './workflow-types'

/** Step names to hide from UI. */
export const IGNORED_STEPS = new Set([
  'Set up job',
  'Complete job',
  'Post Installing tools and dependencies',
  'Post Cloning git repository',
])

/**
 * Check if all steps in all jobs are completed.
 * @param jobs - Workflow jobs to inspect, or undefined when not yet loaded
 * @returns True when every step in every job reports status "completed"
 */
export const jobsAreFinal = (
  jobs: ReadonlyArray<WorkflowJob> | undefined
): boolean =>
  !!jobs &&
  jobs.length > 0 &&
  jobs.every(j => j.steps.every(s => s.status === 'completed'))
