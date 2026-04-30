import type { Ref } from 'vue'
import { generateNotificationId } from './notifications-id'
import type {
  NotificationEntry,
  NotificationInput,
} from './notifications-types'

/**
 * Build the `notify` action. Appends a new entry built from the
 * caller input plus a fresh id and timestamp, and returns the id
 * so that the caller can later dismiss it programmatically.
 * @param items Reactive ref backing the queue.
 * @returns Function that pushes an entry and returns its id.
 */
export const createNotifyAction =
  (items: Ref<readonly NotificationEntry[]>) =>
  (input: NotificationInput): string => {
    const id = generateNotificationId()
    const entry: NotificationEntry = {
      id,
      createdAt: Date.now(),
      ...input,
    }
    items.value = [...items.value, entry]
    return id
  }
