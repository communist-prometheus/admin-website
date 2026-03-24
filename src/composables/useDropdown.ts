import { onMounted, onUnmounted, ref } from 'vue'

/**
 * Vue composable for managing dropdown visibility with click-outside handling.
 * @returns Dropdown state and control methods
 */
export const useDropdown = () => {
  const show = ref(false)

  const toggle = () => {
    show.value = !show.value
  }

  const close = (event: MouseEvent) => {
    if (typeof window === 'undefined') return
    const target = event.target
    if (!(target instanceof HTMLElement)) return
    if (!target.closest('.auth-dropdown')) {
      show.value = false
    }
  }

  onMounted(() => {
    if (typeof document !== 'undefined') {
      document.addEventListener('click', close)
    }
  })

  onUnmounted(() => {
    if (typeof document !== 'undefined') {
      document.removeEventListener('click', close)
    }
  })

  return { show, toggle, close }
}
