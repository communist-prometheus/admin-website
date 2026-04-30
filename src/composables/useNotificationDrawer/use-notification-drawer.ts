import { ref } from 'vue'

const isOpen = ref(false)

/**
 * Module-shared state and actions controlling the notifications
 * history drawer. Module-level ref keeps the API trivial for the
 * single drawer instance the app mounts at root.
 * @returns Reactive `isOpen` plus open/close/toggle actions.
 */
export const useNotificationDrawer = () => ({
  isOpen,
  open: (): void => {
    isOpen.value = true
  },
  close: (): void => {
    isOpen.value = false
  },
  toggle: (): void => {
    isOpen.value = !isOpen.value
  },
})
