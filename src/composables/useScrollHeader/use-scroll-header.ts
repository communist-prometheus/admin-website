import { onMounted, onUnmounted, ref } from 'vue'
import { computeOffset } from './compute-offset'

/**
 * Track scroll direction and compute header translateY.
 * Returns a reactive offset (0 = visible, -height = hidden).
 * @param headerHeight - Header height in pixels
 * @returns Reactive offset ref
 */
export const useScrollHeader = (headerHeight = 60) => {
  const offset = ref(0)
  let prevY = 0
  let ticking = false

  const onScroll = () => {
    if (ticking) return
    ticking = true
    requestAnimationFrame(() => {
      const currY = globalThis.scrollY
      offset.value = computeOffset(prevY, currY, offset.value, headerHeight)
      prevY = currY
      ticking = false
    })
  }

  onMounted(() => {
    prevY = globalThis.scrollY
    globalThis.addEventListener('scroll', onScroll, {
      passive: true,
    })
  })

  onUnmounted(() => {
    globalThis.removeEventListener('scroll', onScroll)
  })

  return { offset }
}
