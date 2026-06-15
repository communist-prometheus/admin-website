/**
 * Toggle a single recipient id in/out of the current selection.
 * @param selected Currently selected ids.
 * @param id The id to flip.
 * @returns The next selection.
 */
export const toggleId = (
  selected: readonly number[],
  id: number
): number[] =>
  selected.includes(id) ? selected.filter(x => x !== id) : [...selected, id]

/**
 * Whether every available id is currently selected (and there is at
 * least one to select).
 * @param selected Currently selected ids.
 * @param allIds Every selectable id.
 * @returns True when the selection covers all ids.
 */
export const isAllSelected = (
  selected: readonly number[],
  allIds: readonly number[]
): boolean => allIds.length > 0 && allIds.every(id => selected.includes(id))

/**
 * Flip the "select all" control: clear when everything is already
 * selected, otherwise select every available id.
 * @param selected Currently selected ids.
 * @param allIds Every selectable id.
 * @returns The next selection.
 */
export const toggleAll = (
  selected: readonly number[],
  allIds: readonly number[]
): number[] => (isAllSelected(selected, allIds) ? [] : [...allIds])
