import { ref } from 'vue'
import { createHistoryActions } from './notifications-history-actions'
import type { HistoryEntry } from './notifications-history-types'
import {
  createHistoryViews,
  type HistoryFilter,
} from './notifications-history-views'

/**
 * Build the reactive state and async actions for the notifications
 * history store. Hydration is lazy — call `hydrate()` once at app
 * boot to populate the entries ref from IDB.
 * @returns Refs (entries, hydrated, filter) plus computed views
 *          (visible, unreadCount) plus async actions.
 */
export const createNotificationsHistoryState = () => {
  const items = ref<readonly HistoryEntry[]>([])
  const hydrated = ref(false)
  const filter = ref<HistoryFilter>('all')
  const actions = createHistoryActions(items)
  const views = createHistoryViews(items, filter)
  const hydrate = async (): Promise<void> => {
    await actions.refresh()
    hydrated.value = true
  }
  return {
    entries: items,
    hydrated,
    filter,
    ...views,
    hydrate,
    ...actions,
  }
}
