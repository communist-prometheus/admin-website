/**
 * Service Worker communication protocol types.
 * Used by both the SW and the client composables.
 */

export {
  SW_LOG_CHANNEL,
  SW_PROGRESS_CHANNEL,
  SW_STATE_CHANNEL,
  SW_VERSION,
} from './protocol/channels'
export type {
  LogCategory,
  LogEntry,
  LogLevel,
} from './protocol/log-types'
export {
  INITIAL_PUSH_STATE,
  type PushState,
  type PushStatus,
  SW_PUSH_STATE_CHANNEL,
} from './protocol/push-state'
export type {
  SWFetchRequest,
  SWFetchResponse,
  SWGitConfig,
  SWMetricsResponse,
  SWProgressEvent,
  SWRequest,
  SWState,
  SWStatusResponse,
} from './protocol/sw-types'
