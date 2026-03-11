import { getGitHubConfig } from '@/config/github'
import type { SWGitConfig } from '@/sw/protocol'
import { sendSWMessage } from './send-message'
import { log } from './sw-log'

const MOCK_TOKEN = 'mock-token'

/**
 * Detect mock mode from the token value (set by mock OAuth).
 * @param token - Token to check
 * @returns True if token is the mock sentinel value
 */
const isMockToken = (token: string): boolean => token === MOCK_TOKEN

/**
 * Send the git config and auth token to the Service Worker.
 * Should be called after the SW is registered and the user is
 * authenticated.
 * @param token - GitHub access token
 * @returns Promise that resolves when SW acknowledges
 */
export const initSWWithToken = async (token: string): Promise<void> => {
  const repoConfig = getGitHubConfig()
  const config: SWGitConfig = {
    ...repoConfig,
    token,
    mock: isMockToken(token),
  }

  try {
    await sendSWMessage({ type: 'SW_INIT', config })
    log('info', 'SW initialized with config')
  } catch (e) {
    log('error', 'Failed to init SW', {
      error: e instanceof Error ? e.message : String(e),
    })
  }
}
