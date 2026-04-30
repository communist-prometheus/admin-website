import { onUnmounted } from 'vue'
import type { LogEntry } from '@/sw/protocol'
import { SW_LOG_CHANNEL } from '@/sw/protocol'
import { recordLog } from './exporter-logs'
import { logFromSWEntry } from './log-from-sw'

const noop = (): void => undefined

/**
 * Wire a BroadcastChannel listener that forwards SW log entries
 * into the log exporter buffer. Returns a disposer.
 *
 * Pure (non-Vue) for testability — `useLogBridge` adds the
 * `onUnmounted` hook on top.
 * @returns Function that closes the channel listener.
 */
export const bridgeSWLogs = (): (() => void) => {
  const supported = typeof BroadcastChannel !== 'undefined'
  const channel = supported ? new BroadcastChannel(SW_LOG_CHANNEL) : undefined
  const handle = (event: MessageEvent<LogEntry>): void => {
    recordLog(logFromSWEntry(event.data))
  }
  const close = channel === undefined ? noop : () => channel.close()
  const wire =
    channel === undefined
      ? noop
      : () => {
          channel.onmessage = handle
        }
  wire()
  return close
}

/**
 * Vue composable wrapping `bridgeSWLogs` with lifecycle teardown.
 * Mount once near the app root alongside `useExporterBootstrap`.
 * @returns void
 */
export const useLogBridge = (): void => {
  const close = bridgeSWLogs()
  onUnmounted(close)
}
