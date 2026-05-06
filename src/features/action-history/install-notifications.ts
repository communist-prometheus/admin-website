import { storeToRefs } from 'pinia'
import { watch } from 'vue'
import { useNotificationsStore } from '@/stores/notifications'
import type { NotificationEntry } from '@/stores/notifications-types'
import { recordAction } from './recorder'

const SW_ERROR = 'sw-error' as const
const NETWORK_ERROR = 'network-error' as const

const reasonText = (n: NotificationEntry): string =>
  n.message === undefined ? n.title : `${n.title}: ${n.message}`

const RECORDERS: Partial<
  Record<NotificationEntry['kind'], (n: NotificationEntry) => void>
> = {
  error: n => void recordAction({ kind: SW_ERROR, reason: reasonText(n) }),
  network: n =>
    void recordAction({
      kind: NETWORK_ERROR,
      url: '',
      reason: reasonText(n),
    }),
}

const toAction = (n: NotificationEntry): void => {
  RECORDERS[n.kind]?.(n)
}

/**
 * Mirror error / network entries from the notifications queue into
 * the action-history ring buffer.
 *
 * Called once at app boot (sibling of `useNotificationsPersistence`).
 * Lives outside the notifications module so the action-history
 * feature stays self-contained.
 */
export const installNotificationsRecording = (): void => {
  const queue = useNotificationsStore()
  const { entries } = storeToRefs(queue)
  watch(
    entries,
    (next, prev) => {
      const seen = new Set((prev ?? []).map(e => e.id))
      next.filter(e => !seen.has(e.id)).forEach(toAction)
    },
    { flush: 'post' }
  )
}
