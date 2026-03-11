import { getGitHubConfig } from '@/config/github'
import type { SWGitConfig } from '@/sw/protocol'
import { sendSWMessage } from './send-message'
import { log } from './sw-log'
import { markSWReady } from './sw-ready'

const MOCK_TOKEN = 'mock-token'

/**
 * Detect mock mode from the token value (set by mock OAuth).
 * @param token - Token to check
 * @returns True if token is the mock sentinel value
 */
const isMockToken = (token: string): boolean => token === MOCK_TOKEN

/**
 * Build SW config from repo settings and token.
 * @param token - GitHub access token
 * @returns Complete SWGitConfig
 */
const buildConfig = (token: string): SWGitConfig => ({
  ...getGitHubConfig(),
  token,
  mock: isMockToken(token),
})

/**
 * Send git config and auth token to the Service Worker.
 * Resolves only after SW finishes repo initialization.
 * @param token - GitHub access token
 */
export const initSWWithToken = async (token: string): Promise<void> => {
  try {
    await sendSWMessage({ type: 'SW_INIT', config: buildConfig(token) })
    markSWReady()
    log('info', 'SW initialized and ready')
  } catch (e) {
    log('error', 'Failed to init SW', {
      error: e instanceof Error ? e.message : String(e),
    })
  }
}
