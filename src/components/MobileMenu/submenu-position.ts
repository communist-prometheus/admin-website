import type { CSSProperties } from 'vue'

/*
 * Position the submenu popup so it sits BELOW the tapped group row.
 * This keeps the row itself exposed — a second tap on the same row
 * must close the submenu (toggle behaviour) — and lets the user swap
 * to a different group by tapping any row ABOVE the submenu that is
 * still visible in the main drawer.
 */
/** Anchor rect + FAB corner flag used to place the submenu popup. */
export interface SubmenuAnchor {
  readonly rowTop: number
  readonly rowBottom: number
  readonly rowLeft: number
  readonly rowRight: number
  readonly fabOnRight: boolean
}

const GAP = 4
const EDGE = 12

/**
 * Compute inline styles for the submenu popup given the anchor row's
 * viewport rect and which side the FAB (and therefore the main drawer)
 * lives on.
 *
 * @param anchor Position + geometry of the group row that was tapped.
 * @returns CSS positioning for the floating submenu.
 */
export const submenuPosition = (anchor: SubmenuAnchor): CSSProperties => {
  /*
   * Block-axis: submenu starts a hair below the tapped row so the row
   * itself remains visible and clickable (toggle-close on second tap).
   */
  const top = `${Math.round(anchor.rowBottom + GAP)}px`
  /*
   * Inline-axis: on a right-anchored FAB (default), the main drawer's
   * right edge is at `anchor.rowRight + drawer padding` — align the
   * submenu's right edge to the tapped row's right edge minus the
   * drawer padding so it sits within the drawer's visual column.
   */
  return anchor.fabOnRight
    ? {
        top,
        right: `${Math.max(EDGE, window.innerWidth - anchor.rowRight - EDGE)}px`,
        left: 'auto',
      }
    : {
        top,
        left: `${Math.max(EDGE, anchor.rowLeft - EDGE)}px`,
        right: 'auto',
      }
}
