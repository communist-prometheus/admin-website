import type { Ref } from 'vue'
import { unref } from 'vue'
import { computeOffset } from './compute-offset'

/**
 * Create a throttled scroll listener that updates offset.
 * @param offset - Reactive offset ref to update
 * @param headerHeight - Header height ref or number
 * @returns Scroll event handler and prevY state
 */
export const createScrollListener = (
  offset: Ref<number>,
  headerHeight: Ref<number> | number
) => {
  let prevY = 0
  let ticking = false

  const handler = () => {
    if (ticking) return
    ticking = true
    requestAnimationFrame(() => {
      const currY = globalThis.scrollY
      const h = unref(headerHeight)
      offset.value = computeOffset(prevY, currY, offset.value, h)
      prevY = currY
      ticking = false
    })
  }

  return {
    handler,
    setPrevY: (v: number) => {
      prevY = v
    },
  }
}
