import { ref } from 'vue'
import { createNotifyAction } from './notifications-add'
import { createDismissAction } from './notifications-dismiss'
import type { NotificationEntry } from './notifications-types'

/**
 * Build the reactive state and actions for the notifications store.
 * Kept separate from the Pinia wrapper so the same factory can be
 * exercised in unit tests without spinning up a full app.
 * @returns Bound state ref plus notify/dismiss/clear actions.
 */
export const createNotificationsState = () => {
  const items = ref<readonly NotificationEntry[]>([])
  const clear = (): void => {
    items.value = []
  }
  return {
    entries: items,
    notify: createNotifyAction(items),
    dismiss: createDismissAction(items),
    clear,
  }
}
