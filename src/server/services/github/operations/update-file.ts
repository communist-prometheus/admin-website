import type { Octokit } from '@octokit/rest'
import { Effect } from 'effect'
import type { GitHubConfig } from '../types'

/**
 * Update file operation
 * @param octokit - Octokit instance
 * @param config - GitHub configuration
 * @returns Function to update file
 */
export const updateFile = (octokit: Octokit, config: GitHubConfig) => {
  return (path: string, content: string, sha: string, message: string) =>
    Effect.tryPromise({
      try: async () => {
        const { data } = await octokit.repos.createOrUpdateFileContents({
          owner: config.owner,
          repo: config.repo,
          path,
          message,
          content: Buffer.from(content).toString('base64'),
          sha,
        })

        return data
      },
      catch: error => new Error(`Failed to update file: ${String(error)}`),
    })
}
