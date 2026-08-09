import { resolveCommitIdentity } from './identity'

/**
 * Return `config` with its author name/email overridden by the identity
 * of its own token, so the commit author always matches the pusher.
 * Leaves the config untouched when the identity can't be resolved.
 * @param config - SW git config (carries the token)
 * @returns Config with a token-derived author
 */
export const withTokenIdentity = async <
  T extends {
    readonly token: string
    authorName?: string
    authorEmail?: string
  },
>(
  config: T
): Promise<T> => {
  const identity = await resolveCommitIdentity(config.token)
  return identity === undefined
    ? config
    : { ...config, authorName: identity.name, authorEmail: identity.email }
}
