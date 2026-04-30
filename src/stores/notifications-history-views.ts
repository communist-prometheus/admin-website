import { computed, type Ref } from 'vue'
import type { HistoryEntry } from './notifications-history-types'
import type { NotificationKind } from './notifications-types'

/** Filter chip selection used by the drawer. */
export type HistoryFilter = NotificationKind | 'all'

/**
 * Build the derived state computeds for the history store: a
 * filtered `visible` view plus an `unreadCount` for the indicator.
 * @param items Reactive entries ref backing the store.
 * @param filter Reactive filter chip selection.
 * @returns Object exposing `visible` and `unreadCount` computeds.
 */
export const createHistoryViews = (
  items: Ref<readonly HistoryEntry[]>,
  filter: Ref<HistoryFilter>
) => ({
  visible: computed(() =>
    filter.value === 'all'
      ? items.value
      : items.value.filter(e => e.kind === filter.value)
  ),
  unreadCount: computed(
    () => items.value.filter(e => e.readAt === undefined).length
  ),
})
