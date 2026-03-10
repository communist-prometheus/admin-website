import type { LogCategory, LogEntry, LogLevel } from '../protocol'
import { SW_LOG_CHANNEL } from '../protocol'
import type { RingBuffer } from './ring-buffer'
import { createRingBuffer } from './ring-buffer'

const LOG_CAPACITY = 1000

/** Internal state for the logger */
interface LoggerState {
  readonly buffer: RingBuffer<LogEntry>
  channel: BroadcastChannel | undefined
}

const state: LoggerState = {
  buffer: createRingBuffer(LOG_CAPACITY),
  channel: undefined,
}

/**
 * Initialize the BroadcastChannel for log streaming.
 * Safe to call multiple times; only creates one channel.
 */
export const initLogChannel = (): void => {
  if (!state.channel) {
    state.channel = new BroadcastChannel(SW_LOG_CHANNEL)
  }
}

/**
 * Write a structured log entry.
 * @param level - Log severity level
 * @param cat - Log category
 * @param msg - Human-readable message
 * @param data - Optional structured data
 */
export const log = (
  level: LogLevel,
  cat: LogCategory,
  msg: string,
  data?: Record<string, unknown>
): void => {
  const entry: LogEntry = { ts: Date.now(), level, cat, msg, data }
  state.buffer.push(entry)
  state.channel?.postMessage(entry)
}

/**
 * Get all buffered log entries.
 * @returns Readonly array of log entries
 */
export const getLogEntries = (): readonly LogEntry[] => state.buffer.entries()

/** Clear all buffered log entries. */
export const clearLogEntries = (): void => {
  state.buffer.clear()
}
