import type { Ref } from 'vue'
import type { NotificationEntry } from './notifications-types'

/**
 * Build the `dismiss` action. Removes the entry whose id matches;
 * returns silently when the id is unknown so call sites can fire
 * a dismiss without first reading the queue.
 * @param items Reactive ref backing the queue.
 * @returns Function that removes one entry by id.
 */
export const createDismissAction =
  (items: Ref<readonly NotificationEntry[]>) =>
  (id: string): void => {
    items.value = items.value.filter(entry => entry.id !== id)
  }
