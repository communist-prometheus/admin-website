import { onUnmounted, ref } from 'vue'
import type { LogEntry } from '@/sw/protocol'
import { SW_LOG_CHANNEL } from '@/sw/protocol'

const MAX_CLIENT_LOGS = 500

/**
 * Composable that subscribes to Service Worker log entries
 * via BroadcastChannel. Returns a reactive array of log entries.
 * @returns Reactive log entries ref
 */
export const useSWLogs = () => {
  const entries = ref<readonly LogEntry[]>([])

  if (typeof BroadcastChannel === 'undefined') {
    return { entries }
  }

  const channel = new BroadcastChannel(SW_LOG_CHANNEL)

  channel.onmessage = (event: MessageEvent<LogEntry>) => {
    const current = entries.value
    const next =
      current.length >= MAX_CLIENT_LOGS
        ? [...current.slice(1), event.data]
        : [...current, event.data]
    entries.value = next
  }

  onUnmounted(() => channel.close())

  return { entries }
}
