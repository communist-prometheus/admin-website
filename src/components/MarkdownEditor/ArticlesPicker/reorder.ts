const swap = <T>(list: readonly T[], a: number, b: number): readonly T[] => {
  const next = [...list]
  ;[next[a], next[b]] = [next[b] as T, next[a] as T]
  return next
}

/**
 * Move the item at `index` one slot toward the start of the list.
 * No-op when index is 0 or out of range.
 *
 * @param list Current ordered list.
 * @param index Index of the item to move up.
 * @returns A new list with the move applied (or the original ref).
 */
export const moveUp = <T>(list: readonly T[], index: number): readonly T[] =>
  index <= 0 || index >= list.length ? list : swap(list, index - 1, index)

/**
 * Move the item at `index` one slot toward the end of the list.
 * No-op when index is the last or out of range.
 *
 * @param list Current ordered list.
 * @param index Index of the item to move down.
 * @returns A new list with the move applied (or the original ref).
 */
export const moveDown = <T>(
  list: readonly T[],
  index: number
): readonly T[] =>
  index < 0 || index >= list.length - 1 ? list : swap(list, index, index + 1)

/**
 * Remove the item at `index`.
 *
 * @param list Current list.
 * @param index Index to drop.
 * @returns A new list without that item.
 */
export const removeAt = <T>(
  list: readonly T[],
  index: number
): readonly T[] => list.filter((_, i) => i !== index)
