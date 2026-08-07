import type { SWGitConfig } from '../../../protocol'

/**
 * The `/repos/{owner}/{repo}` prefix for GitHub REST calls.
 * @param config - SW git configuration
 * @returns Repo path prefix
 */
export const repoPath = (config: SWGitConfig): string =>
  `/repos/${config.owner}/${config.repo}`
