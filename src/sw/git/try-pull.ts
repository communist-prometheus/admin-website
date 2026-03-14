import { log } from '../logging/logger'
import type { SWGitConfig } from '../protocol'

/**
 * Attempt to pull. Returns false on non-ff (force push).
 * @param config - Repository configuration
 * @returns true if pull succeeded
 */
export const tryPull = async (config: SWGitConfig): Promise<boolean> => {
  try {
    const { pullRepo } = await import('./pull-repo')
    await pullRepo(config)
    return true
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    log('warn', 'git', `Pull failed, will re-clone: ${msg}`)
    return false
  }
}
