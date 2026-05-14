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

/*
 * Clock-skew slack between client-side `pending.createdAt`
 * (`new Date()` on the user's machine) and the server-side
 * `workflow_runs[].created_at` returned by the GitHub API.
 * A fresh run can legitimately be stamped a few seconds earlier
 * than the pending — the slack absorbs that. Old runs (minutes /
 * hours / days in the past) stay correctly out of the match.
 */
const PENDING_MATCH_SLACK_MS = 60_000

/**
 * Decide whether the pending deploy has been superseded by a real
 * run. Match by commit message + timestamp floor — the admin
 * injects the same message into the content-repo commit that
 * triggers the workflow, but the message is NOT unique across
 * pushes (newspaper edit always emits `updated <title> in
 * newspaper`), so message alone matches old runs that happen to
 * share the text. The timestamp floor restricts the match to runs
 * created at or after the pending was queued (modulo clock skew).
 * @param pending - Pending deploy candidate
 * @param runs - Real runs from the last poll tick
 * @returns True when any real run already represents this pending entry
 */
export const isPendingMatched = (
  pending: PendingDeploy,
  runs: ReadonlyArray<DeployBuild>
): boolean => {
  const floor = Date.parse(pending.createdAt) - PENDING_MATCH_SLACK_MS
  return runs.some(
    b =>
      b.run.head_sha !== PENDING_RUN_PREFIX &&
      Date.parse(b.run.created_at) >= floor &&
      !!b.run.head_commit?.message?.includes(pending.message)
  )
}
