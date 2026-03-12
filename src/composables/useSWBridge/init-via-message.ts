import type { SWGitConfig } from '@/sw/protocol'
import { getActiveWorker } from './get-active-worker'
import { postWithTimeout } from './post-with-timeout'
import { log } from './sw-log'

/**
 * Init SW via MessageChannel (works without controller).
 * @param config - Git config to send
 */
export const initViaMessage = async (config: SWGitConfig): Promise<void> => {
  const w = await getActiveWorker()
  const d = await postWithTimeout<{ ok: boolean }>(w, {
    type: 'SW_INIT',
    config,
  })
  if (d.ok) log('info', 'SW init via message')
}
