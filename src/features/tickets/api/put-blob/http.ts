import {
  TICKETS_BRANCH,
  TICKETS_REPO_NAME,
  TICKETS_REPO_OWNER,
} from '../attachment-paths'

const API = `https://api.github.com/repos/${TICKETS_REPO_OWNER}/${TICKETS_REPO_NAME}/git`

/** Default branch the Git Data API path commits against. */
export const BRANCH = TICKETS_BRANCH

const headers = (token: string) => ({
  Authorization: `Bearer ${token}`,
  Accept: 'application/vnd.github+json',
  'Content-Type': 'application/json',
})

const okOrThrow = async (res: Response, step: string): Promise<Response> =>
  res.ok
    ? res
    : Promise.reject(
        new Error(
          `Git Data API ${step} failed: ${res.status} ${res.statusText}`
        )
      )

/**
 * Single point of contact with the Git Data API. Returns the
 * Response or throws a tagged error so each step's failure mode
 * surfaces to the caller with context.
 * @param token - GitHub token.
 * @param method - HTTP verb (GET / POST / PATCH).
 * @param endpoint - Path under `/git/` (e.g. `blobs`, `refs/heads/master`).
 * @param step - Human-readable label for the step in error messages.
 * @param body - Optional JSON payload.
 * @returns The fetched Response when OK; throws otherwise.
 */
export const request = async (
  token: string,
  method: string,
  endpoint: string,
  step: string,
  body?: unknown
): Promise<Response> => {
  const init: RequestInit = {
    method,
    headers: headers(token),
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  }
  return okOrThrow(await fetch(`${API}/${endpoint}`, init), step)
}
