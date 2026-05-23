import { BRANCH, request } from './http'

/**
 * Read the SHA of the latest commit on the tickets branch.
 * @param token - GitHub token.
 * @returns The branch HEAD commit SHA.
 */
export const headRef = async (token: string): Promise<string> => {
  const res = await request(
    token,
    'GET',
    `ref/heads/${BRANCH}`,
    'read branch ref'
  )
  const data = await res.json()
  return data.object.sha
}

/**
 * Fast-forward the tickets branch to a newly-created commit.
 * @param token - GitHub token.
 * @param commitSha - The commit to point the ref at.
 */
export const updateRef = async (
  token: string,
  commitSha: string
): Promise<void> => {
  await request(token, 'PATCH', `refs/heads/${BRANCH}`, 'update branch ref', {
    sha: commitSha,
  })
}
