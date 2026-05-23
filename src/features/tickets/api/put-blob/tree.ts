import { request } from './http'

/**
 * Read the tree SHA referenced by a commit.
 * @param token - GitHub token.
 * @param commitSha - Commit whose tree is being read.
 * @returns The tree SHA of that commit.
 */
export const treeOfCommit = async (
  token: string,
  commitSha: string
): Promise<string> => {
  const res = await request(
    token,
    'GET',
    `commits/${commitSha}`,
    'read parent commit'
  )
  const data = await res.json()
  return data.tree.sha
}

interface TreeDeps {
  readonly token: string
  readonly baseTree: string
  readonly path: string
  readonly blobSha: string
}

const newEntry = (path: string, blobSha: string) => ({
  path,
  mode: '100644',
  type: 'blob',
  sha: blobSha,
})

/**
 * Create a new tree off `baseTree` containing one blob at `path`.
 * @param deps - Token, base tree SHA, path and blob SHA.
 * @returns The new tree SHA.
 */
export const createTree = async (deps: TreeDeps): Promise<string> => {
  const res = await request(deps.token, 'POST', 'trees', 'create tree', {
    base_tree: deps.baseTree,
    tree: [newEntry(deps.path, deps.blobSha)],
  })
  const data = await res.json()
  return data.sha
}
