import process from 'node:process'

/**
 * Repository coordinates and PAT for the real-mode E2E sandbox.
 * Source of truth for setup, reset, and Playwright config.
 */
export interface SandboxConfig {
  readonly owner: string
  readonly repo: string
  readonly branch: string
  readonly baselineTag: string
  readonly token: string
}

const required = (name: string): string => {
  const v = process.env[name]
  if (!v) throw new Error(`Missing env var: ${name}`)
  return v
}

/**
 * Read sandbox config from process env, with sensible defaults.
 * GITHUB_E2E_KEY must have `repo` scope on the sandbox owner.
 * @returns Resolved sandbox config
 */
export const readSandboxConfig = (): SandboxConfig => ({
  owner: process.env['SANDBOX_OWNER'] ?? 'communist-prometheus',
  repo: process.env['SANDBOX_REPO'] ?? 'admin-e2e-sandbox',
  branch: process.env['SANDBOX_BRANCH'] ?? 'main',
  baselineTag: process.env['SANDBOX_BASELINE_TAG'] ?? 'baseline',
  token: required('GITHUB_E2E_KEY'),
})

/**
 * Build a `Headers` object pre-populated with auth + JSON accept.
 * @param token - GitHub PAT
 * @returns Header set ready for fetch()
 */
export const ghHeaders = (token: string): HeadersInit => ({
  authorization: `Bearer ${token}`,
  accept: 'application/vnd.github+json',
  'x-github-api-version': '2022-11-28',
})
