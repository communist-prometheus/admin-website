import { computed, ref } from 'vue'
import type { Subscriber } from '@/stores/comms'
import {
  countByStatus,
  filterByStatus,
  type StatusFilterValue,
} from './status-counts'

/**
 * Status-filter UI state, pulled out of CommsView so the view stays
 * under the max-lines cap.
 * @param source Getter for the full, unfiltered subscriber list.
 * @returns The active filter, per-status counts, and the filtered list.
 */
export const useStatusFilter = (source: () => readonly Subscriber[]) => {
  const statusFilter = ref<StatusFilterValue>('all')
  const counts = computed(() => countByStatus(source()))
  const visible = computed(() => filterByStatus(source(), statusFilter.value))
  const setStatusFilter = (value: StatusFilterValue): void => {
    statusFilter.value = value
  }
  return { statusFilter, counts, visible, setStatusFilter }
}
