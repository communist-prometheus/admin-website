import { readSandboxConfig } from '../../scripts/sandbox-config'

/**
 * Sandbox config singleton. Resolved once at import time so per-call
 * helpers don't repeatedly reparse env. Tests are run by a single
 * worker, so a shared instance is safe.
 */
export const cfg = readSandboxConfig()

/**
 * Standard auth headers for sandbox-side GitHub API calls (read paths
 * outside the SW push queue).
 * @returns Header set ready for fetch()
 */
export const apiHeaders = (): HeadersInit => ({
  authorization: `Bearer ${cfg.token}`,
  accept: 'application/vnd.github+json',
  'x-github-api-version': '2022-11-28',
})

/** Base URL for sandbox-side reads. */
export const GH_API = 'https://api.github.com'
