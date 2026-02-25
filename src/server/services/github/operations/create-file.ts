import type { Octokit } from '@octokit/rest'
import { Effect } from 'effect'
import type { GitHubConfig } from '../types'

export const createFile = (octokit: Octokit, config: GitHubConfig) => {
  return (path: string, content: string, message: string) =>
    Effect.tryPromise({
      try: async () => {
        const { data } = await octokit.repos.createOrUpdateFileContents({
          owner: config.owner,
          repo: config.repo,
          path,
          message,
          content: Buffer.from(content).toString('base64'),
        })

        return data
      },
      catch: error => new Error(`Failed to create file: ${String(error)}`),
    })
}
