import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'

/**
 * Reactive menu open state that auto-closes on navigation.
 * @returns Open ref and close handler
 */
export const useMenuState = () => {
  const menuOpen = ref(false)
  const route = useRoute()

  watch(
    () => route.fullPath,
    () => {
      menuOpen.value = false
    }
  )

  /** Close the mobile menu. */
  const close = () => {
    menuOpen.value = false
  }

  /** Toggle the mobile menu. */
  const toggle = () => {
    menuOpen.value = !menuOpen.value
  }

  return { menuOpen, close, toggle }
}
