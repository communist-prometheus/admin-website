import type { CSSProperties } from 'vue'
import type { FabCoords } from '@/composables/useDraggableFab'

/**
 * Convert FAB coordinates to CSS position style.
 * @param isDragging - Whether FAB is being dragged
 * @param dragPos - Current drag coordinates
 * @param pos - Computed corner position
 * @returns CSSProperties for FAB placement
 */
export const fabPosition = (
  isDragging: boolean,
  dragPos: FabCoords,
  pos: FabCoords
): CSSProperties => {
  const { x, y } = isDragging ? dragPos : pos
  return {
    left: `${x}px`,
    top: `${y}px`,
    transition: isDragging ? 'none' : 'all var(--transition-base)',
  }
}
