import type { SWGitConfig } from '../protocol'

/**
 * Check if running in mock mode (build-time or config).
 * @param config - SW git configuration
 * @returns true when mock data should be used
 */
export const isMock = (config: SWGitConfig): boolean =>
  __MOCK_MODE__ || !!config.mock
