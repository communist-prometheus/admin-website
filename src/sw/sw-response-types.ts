import type { SWState } from './sw-request-types'

/** Response to SW_STATUS */
export interface SWStatusResponse {
  readonly state: SWState
  readonly cloned: boolean
  readonly lastSync: number | undefined
  readonly commitSha: string | undefined
  readonly fsBytes: number
  readonly version: string
}

/** Response to SW_METRICS */
export interface SWMetricsResponse {
  readonly ops: Record<
    string,
    { readonly count: number; readonly totalMs: number }
  >
  readonly cache: {
    readonly hits: number
    readonly misses: number
  }
  readonly uptime: number
}

/** Progress event sent via BroadcastChannel */
export interface SWProgressEvent {
  readonly phase: string
  readonly loaded: number
  readonly total: number
}
