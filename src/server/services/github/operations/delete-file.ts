import type { Octokit } from '@octokit/rest'
import { Effect } from 'effect'
import type { GitHubConfig } from '../types'

export const deleteFile = (octokit: Octokit, config: GitHubConfig) => {
  return (path: string, sha: string, message: string) =>
    Effect.tryPromise({
      try: async () => {
        const { data } = await octokit.repos.deleteFile({
          owner: config.owner,
          repo: config.repo,
          path,
          message,
          sha,
        })

        return data
      },
      catch: error => new Error(`Failed to delete file: ${String(error)}`),
    })
}
