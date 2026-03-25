import type { CSSProperties } from 'vue'

/**
 * Compute popup menu styles based on open state.
 * Menu appears above the FAB button, anchored to same edge.
 * @param open - Whether menu is visible
 * @returns CSS properties for the popup
 */
export const overlayStyle = (open: boolean): CSSProperties =>
  open
    ? {
        opacity: 1,
        transform: 'translateY(0)',
        pointerEvents: 'auto',
      }
    : {
        opacity: 0,
        transform: 'translateY(8px)',
        pointerEvents: 'none',
      }
