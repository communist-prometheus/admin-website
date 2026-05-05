import type { WorkflowRun } from '@/composables/useDeployStatus/workflow-types'

const completedBadge = (run: WorkflowRun): string =>
  run.conclusion === 'success' ? 'success' : (run.conclusion ?? 'failure')

/**
 * Reduce the workflow run's status + conclusion to a single
 * lowercase badge string used by the deploy item header.
 *
 * @param run Workflow run from the GitHub Actions API.
 * @returns 'success' | 'failure' | 'cancelled' | 'building' | 'queued' | etc.
 */
export const computeBadge = (run: WorkflowRun): string =>
  run.status === 'completed'
    ? completedBadge(run)
    : run.status === 'in_progress'
      ? 'building'
      : 'queued'
