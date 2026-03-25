import type { SWGitConfig, SWState } from '../protocol'

/** Mutable Service Worker state */
interface WorkerState {
  config: SWGitConfig | undefined
  state: SWState
  lastSync: number | undefined
  commitSha: string | undefined
}

/**
 * Global mutable state for the Service Worker.
 * Stored in module scope — persists for SW lifetime.
 */
export const workerState: WorkerState = {
  config: undefined,
  state: 'idle',
  lastSync: undefined,
  commitSha: undefined,
}
