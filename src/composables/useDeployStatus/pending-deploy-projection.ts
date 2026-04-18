import type { PendingDeploy } from './pending-deploy-types'
import type { DeployBuild, WorkflowRun } from './workflow-types'

/** Sentinel head_sha used so real runs never match the placeholder. */
export const PENDING_RUN_PREFIX = 'pending-'

/**
 * Project a pending deploy into a synthetic DeployBuild so it can be
 * merged into the unified entries list. The real run replaces it the
 * moment a matching commit message lands from GitHub.
 * @param p - Pending deploy entry
 * @returns Synthetic DeployBuild shaped for the home list
 */
export const pendingToDeployBuild = (p: PendingDeploy): DeployBuild => {
  const run: WorkflowRun = {
    id: Number.NaN,
    name: 'Deploy to Cloudflare Workers',
    status: 'queued',
    conclusion: undefined,
    head_branch: 'master',
    head_sha: PENDING_RUN_PREFIX,
    created_at: p.createdAt,
    updated_at: p.createdAt,
    head_commit: {
      message: p.message,
      author: { name: 'you', email: '' },
    },
  }
  return { run, jobs: [] }
}

/**
 * Decide whether the pending deploy has been superseded by a real
 * run. Match by commit message — the admin injects the same message
 * into the content-repo commit that triggers the workflow.
 * @param pending - Pending deploy candidate
 * @param runs - Real runs from the last poll tick
 * @returns True when any real run already represents this pending entry
 */
export const isPendingMatched = (
  pending: PendingDeploy,
  runs: ReadonlyArray<DeployBuild>
): boolean =>
  runs.some(
    b =>
      b.run.head_sha !== PENDING_RUN_PREFIX &&
      !!b.run.head_commit?.message?.includes(pending.message)
  )
