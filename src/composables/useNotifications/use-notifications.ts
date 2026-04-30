import { storeToRefs } from 'pinia'
import { useNotificationsStore } from '@/stores/notifications'

/**
 * Reactive notifications API. Returns a readonly view of the queue
 * plus bound notify/dismiss/clear actions, suitable for direct use
 * in `<script setup>` and helper composables alike.
 * @returns Readonly entries ref + bound store actions.
 */
export const useNotifications = () => {
  const store = useNotificationsStore()
  const { entries } = storeToRefs(store)
  return {
    entries,
    notify: store.notify,
    dismiss: store.dismiss,
    clear: store.clear,
  }
}
