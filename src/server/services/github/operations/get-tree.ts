import type { Octokit } from '@octokit/rest'
import { Effect } from 'effect'
import type { GitHubConfig, TreeItem } from '../types'

const mapToTreeItem = (item: {
  path: string
  type: string
  sha: string
  size: number
  name: string
}): TreeItem =>
  ({
    path: item.path,
    type: item.type,
    sha: item.sha,
    size: item.size,
    name: item.name,
  }) as TreeItem

const mapResponseToTreeItems = (
  data:
    | { path: string; type: string; sha: string; size: number; name: string }
    | Array<{
        path: string
        type: string
        sha: string
        size: number
        name: string
      }>
): TreeItem[] => {
  if (!Array.isArray(data)) {
    return [mapToTreeItem(data)]
  }
  return data.map(mapToTreeItem)
}

export const getTree = (octokit: Octokit, config: GitHubConfig) => {
  return (path: string = 'src/content') =>
    Effect.tryPromise({
      try: async () => {
        const { data } = await octokit.repos.getContent({
          owner: config.owner,
          repo: config.repo,
          path,
        })
        return mapResponseToTreeItems(data)
      },
      catch: error => new Error(`Failed to get tree: ${String(error)}`),
    })
}
