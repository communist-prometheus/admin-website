import type { CSSProperties } from 'vue'
import type { Corner } from '@/composables/useDraggableFab'
import {
  FAB_MARGIN,
  FAB_SIZE,
} from '@/composables/useDraggableFab/fab-constants'

const GAP = 8

/**
 * Compute menu position relative to FAB corner.
 * Uses left+bottom for animatable transitions.
 * @param corner - Current FAB corner
 * @returns CSS positioning for the popup
 */
export const menuPosition = (corner: Corner): CSSProperties => {
  const isRight = corner.endsWith('right')
  const isBottom = corner.startsWith('bottom')
  const x = isRight
    ? `calc(100vw - ${FAB_SIZE + FAB_MARGIN}px)`
    : `${FAB_MARGIN}px`
  const y = isBottom
    ? `${FAB_SIZE + FAB_MARGIN + GAP}px`
    : `${FAB_MARGIN + FAB_SIZE + GAP}px`

  return {
    left: x,
    ...(isBottom ? { bottom: y, top: 'auto' } : { top: y, bottom: 'auto' }),
  }
}
