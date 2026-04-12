import { mintInstallationToken } from './mint-token'
import { signAppJwt } from './sign-jwt'
import type { ResolvedConfig } from './validate-config'

/** Token + expiry subset returned to the frontend. */
export interface AppToken {
  readonly token: string
  readonly expires_at: string
}

/**
 * Mint a fresh GitHub App installation access token for the given config.
 * @param config - Validated worker env containing app ID, installation ID
 * and private key PEM
 * @returns Short-lived installation token with its expiry timestamp
 */
export const mintForCreds = async (
  config: ResolvedConfig
): Promise<AppToken> => {
  const jwt = await signAppJwt(config.privateKey, config.appId)
  const tok = await mintInstallationToken(jwt, config.installationId)
  return { token: tok.token, expires_at: tok.expires_at }
}
