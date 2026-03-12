import { getGitHubConfig } from '@/config/github'
import type { SWGitConfig } from '@/sw/protocol'

const MOCK_TOKEN = 'mock-token'

/**
 * Build SW config from repo settings and token.
 * @param token - GitHub access token
 * @returns Complete SWGitConfig
 */
export const buildSWConfig = (token: string): SWGitConfig => ({
  ...getGitHubConfig(),
  token,
  mock: token === MOCK_TOKEN,
})
