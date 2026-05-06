import {
  TICKETS_BRANCH,
  TICKETS_REPO_NAME,
  TICKETS_REPO_OWNER,
} from './attachment-paths'

const API = `https://api.github.com/repos/${TICKETS_REPO_OWNER}/${TICKETS_REPO_NAME}/contents`

const headers = (token: string) => ({
  Authorization: `Bearer ${token}`,
  Accept: 'application/vnd.github+json',
  'Content-Type': 'application/json',
})

interface PutDeps {
  readonly token: string
  readonly path: string
  readonly content: string
  readonly message: string
}

const okOrThrow = async (res: Response): Promise<void> =>
  res.ok
    ? undefined
    : Promise.reject(
        new Error(`Upload failed: ${res.status} ${res.statusText}`)
      )

/**
 * PUT raw base64 content into the tickets repo via the Contents API.
 * @param deps - Token + repo path + base64 content + commit message
 */
export const putContent = async (deps: PutDeps): Promise<void> => {
  const res = await fetch(`${API}/${deps.path}`, {
    method: 'PUT',
    headers: headers(deps.token),
    body: JSON.stringify({
      message: deps.message,
      content: deps.content,
      branch: TICKETS_BRANCH,
    }),
  })
  await okOrThrow(res)
}
