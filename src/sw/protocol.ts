/**
 * Service Worker communication protocol types.
 * Used by both the SW and the client composables.
 */

export {
  SW_LOG_CHANNEL,
  SW_PROGRESS_CHANNEL,
  SW_STATE_CHANNEL,
  SW_VERSION,
} from './channels'
export type {
  LogCategory,
  LogEntry,
  LogLevel,
} from './log-types'
export type {
  SWGitConfig,
  SWMetricsResponse,
  SWProgressEvent,
  SWRequest,
  SWState,
  SWStatusResponse,
} from './sw-types'
