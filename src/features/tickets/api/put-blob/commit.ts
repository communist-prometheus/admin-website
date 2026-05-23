import { request } from './http'

interface CommitDeps {
  readonly token: string
  readonly message: string
  readonly tree: string
  readonly parent: string
}

/**
 * Create a commit pointing at `tree` with one parent.
 * @param deps - Token, message, tree SHA, parent commit SHA.
 * @returns The new commit SHA.
 */
export const createCommit = async (deps: CommitDeps): Promise<string> => {
  const res = await request(deps.token, 'POST', 'commits', 'create commit', {
    message: deps.message,
    tree: deps.tree,
    parents: [deps.parent],
  })
  const data = await res.json()
  return data.sha
}
