import type { SWStatusResponse } from '../protocol'
import { SW_VERSION } from '../protocol'
import { workerState } from './state'

/**
 * Build a status response from current worker state.
 * @returns Status snapshot
 */
export const buildStatus = (): SWStatusResponse => ({
  state: workerState.state,
  cloned: workerState.state === 'ready',
  lastSync: workerState.lastSync,
  commitSha: workerState.commitSha,
  fsBytes: 0,
  version: SW_VERSION,
})
