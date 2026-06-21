import { ref } from 'vue'
import type { Subscriber } from '@/stores/comms'

/**
 * Remove-confirm dialog state, pulled out of CommsView so the view
 * stays under the max-lines cap.
 * @param source Getter for the current subscriber list.
 * @param onRemove Handler invoked once a removal is confirmed.
 * @returns The pending target plus request/confirm/cancel actions.
 */
export const useRemoveDialog = (
  source: () => readonly Subscriber[],
  onRemove: (id: number) => void
) => {
  const pendingRemove = ref<Subscriber | undefined>(undefined)
  const requestRemove = (id: number): void => {
    pendingRemove.value = source().find(s => s.id === id)
  }
  const confirmRemove = (): void => {
    const target = pendingRemove.value
    pendingRemove.value = undefined
    void (target === undefined ? undefined : onRemove(target.id))
  }
  const cancelRemove = (): void => {
    pendingRemove.value = undefined
  }
  return { pendingRemove, requestRemove, confirmRemove, cancelRemove }
}
