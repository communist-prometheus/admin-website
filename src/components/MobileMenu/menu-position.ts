import type { CSSProperties } from 'vue'
import type { Corner } from '@/composables/useDraggableFab'

const OFFSET = 72
const MARGIN = 16

/**
 * Compute menu popup position based on FAB corner.
 * Menu opens away from the edge where FAB sits.
 * @param corner - Current FAB corner
 * @returns CSS positioning properties
 */
export const menuPosition = (corner: Corner): CSSProperties => {
  const isRight = corner.endsWith('right')
  const isBottom = corner.endsWith('bottom') || corner.startsWith('bottom')

  return {
    ...(isRight ? { right: `${MARGIN}px` } : { left: `${MARGIN}px` }),
    ...(isBottom ? { bottom: `${OFFSET}px` } : { top: `${OFFSET}px` }),
  }
}
