import type { CfDeploy, DeployEntry, GhCommit } from './types'

const findClosestCommit = (
  deployDate: string,
  commits: readonly GhCommit[]
): GhCommit | undefined => {
  const dt = new Date(deployDate).getTime()
  return commits.find(c => new Date(c.date).getTime() <= dt)
}

/**
 * Merge CF deployments with GitHub commits by timestamp.
 * Each deployment gets the closest prior commit.
 * @param deploys - CF deployment list (newest first)
 * @param commits - GitHub commits (newest first)
 * @returns Merged deploy entries
 */
export const mergeDeployData = (
  deploys: readonly CfDeploy[],
  commits: readonly GhCommit[]
): readonly DeployEntry[] =>
  deploys.map(d => ({
    ...d,
    commit: findClosestCommit(d.createdOn, commits),
  }))
