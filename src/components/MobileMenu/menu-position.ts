import type { CSSProperties } from 'vue'
import type { Corner } from '@/composables/useDraggableFab'
import {
  FAB_MARGIN,
  FAB_SIZE,
} from '@/composables/useDraggableFab/fab-constants'

const GAP = 8

/**
 * Compute menu position relative to FAB corner.
 * Aligns the menu edge to the FAB edge on each axis.
 * @param corner - Current FAB corner
 * @returns CSS positioning for the popup
 */
export const menuPosition = (corner: Corner): CSSProperties => {
  const isRight = corner.endsWith('right')
  const isBottom = corner.startsWith('bottom')
  const y = isBottom
    ? `${FAB_SIZE + FAB_MARGIN + GAP}px`
    : `${FAB_MARGIN + FAB_SIZE + GAP}px`

  return {
    ...(isRight
      ? { left: 'auto', right: `${FAB_MARGIN}px` }
      : { right: 'auto', left: `${FAB_MARGIN}px` }),
    ...(isBottom ? { bottom: y, top: 'auto' } : { top: y, bottom: 'auto' }),
  }
}
