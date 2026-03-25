import type { Ref } from 'vue'
import { onMounted, onUnmounted, ref } from 'vue'
import { createScrollListener } from './create-listener'

/**
 * Track scroll direction and compute header translateY.
 * Returns a reactive offset (0 = visible, -height = hidden).
 * @param headerHeight - Header height ref or number
 * @returns Reactive offset ref
 */
export const useScrollHeader = (headerHeight: Ref<number> | number = 60) => {
  const offset = ref(0)
  const { handler, setPrevY } = createScrollListener(offset, headerHeight)

  onMounted(() => {
    setPrevY(globalThis.scrollY)
    globalThis.addEventListener('scroll', handler, {
      passive: true,
    })
  })

  onUnmounted(() => {
    globalThis.removeEventListener('scroll', handler)
  })

  return { offset }
}
