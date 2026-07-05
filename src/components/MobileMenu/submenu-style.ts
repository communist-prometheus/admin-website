import type { ComputedRef, Ref } from 'vue'
import { submenuPosition } from './submenu-position'

/** Refs owned by useSubmenuState — anchor rect + FAB corner. */
export interface SubmenuStyleInputs {
  readonly anchor: Ref<DOMRect | undefined>
  readonly fabOnRight: ComputedRef<boolean>
}

/**
 * Delegate to submenuPosition with the anchor rect fields spread.
 *
 * @param a Anchor DOMRect (bounding box of the tapped group row).
 * @param fabOnRight Whether the FAB corner is right-anchored.
 * @returns Inline CSS map for the submenu popup.
 */
const styleFromAnchor = (
  a: DOMRect,
  fabOnRight: boolean
): Record<string, string> =>
  submenuPosition({
    rowTop: a.top,
    rowBottom: a.bottom,
    rowLeft: a.left,
    rowRight: a.right,
    fabOnRight,
  }) as Record<string, string>

/**
 * Compute inline CSS for the submenu popup from the tapped row's rect.
 *
 * @param inputs Reactive anchor rect + FAB corner flag.
 * @returns Inline CSS map for `:style="..."`; empty when no anchor is set.
 */
export const submenuStyle = (
  inputs: SubmenuStyleInputs
): Record<string, string> => {
  const a = inputs.anchor.value
  return a === undefined ? {} : styleFromAnchor(a, inputs.fabOnRight.value)
}
