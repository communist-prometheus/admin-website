/*
 * Commit identity derived from the token that will push (not from a
 * client-passed or stale-persisted authorName/authorEmail), so a commit
 * can never be attributed to a different account than the one pushing it.
 */

import { type CommitIdentity, identityFrom } from './github-user'

export type { CommitIdentity } from './github-user'

const API = 'https://api.github.com'

// Keyed by token: /user is stable for a token, so a tiny cache avoids a
// round trip per commit.
const cache = new Map<string, CommitIdentity>()

const remember = (
  token: string,
  identity: CommitIdentity
): CommitIdentity => {
  cache.set(token, identity)
  return identity
}

const fetchIdentity = async (
  token: string
): Promise<CommitIdentity | undefined> => {
  try {
    const res = await fetch(`${API}/user`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github+json',
      },
    })
    const identity = res.ok ? identityFrom(await res.json()) : undefined
    return identity === undefined ? undefined : remember(token, identity)
  } catch {
    return undefined
  }
}

/**
 * Resolve the git commit identity for a token from its GitHub user.
 * @param token - The OAuth token that will author/push the commit
 * @returns The identity, or undefined when it can't be resolved (caller
 *   then keeps whatever author the config already carries)
 */
export const resolveCommitIdentity = async (
  token: string
): Promise<CommitIdentity | undefined> =>
  cache.get(token) ?? (await fetchIdentity(token))
