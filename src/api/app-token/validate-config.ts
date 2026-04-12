import type { Env } from '../app'

/** Resolved worker env needed to mint installation tokens. */
export interface ResolvedConfig {
  readonly adminPassword: string
  readonly privateKey: string
  readonly appId: string
  readonly installationId: string
}

/**
 * Read and validate the GitHub App config from the worker env bindings.
 * @param env - Worker environment bindings
 * @returns Resolved config or undefined when any required binding is missing
 */
export const resolveConfig = (env: Env): ResolvedConfig | undefined => {
  const adminPassword = env.ADMIN_PASSWORD
  const privateKey = env.GH_APP_PRIVATE_KEY
  const appId = env.GH_APP_ID
  const installationId = env.GH_INSTALLATION_ID
  if (!adminPassword || !privateKey || !appId || !installationId) {
    return undefined
  }
  return { adminPassword, privateKey, appId, installationId }
}
