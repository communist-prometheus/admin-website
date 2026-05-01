import { type Ref, ref } from 'vue'

/** Reactive state driving the bulk-select / bulk-delete UX. */
export interface BulkDeleteState {
  readonly selectMode: Ref<boolean>
  readonly selectedSlugs: Ref<ReadonlySet<string>>
  readonly enter: () => void
  readonly exit: () => void
  readonly toggle: (slug: string) => void
}

/**
 * Build the in-memory state for the bulk-delete flow. The list view
 * flips into "select mode" when the editor clicks Select; each row
 * then accumulates a checkbox and clicking it toggles the slug in
 * `selectedSlugs`. Exit clears the selection.
 * @returns BulkDeleteState
 */
export const createBulkDeleteState = (): BulkDeleteState => {
  const selectMode = ref(false)
  const selectedSlugs = ref<ReadonlySet<string>>(new Set())
  const enter = (): void => {
    selectMode.value = true
  }
  const exit = (): void => {
    selectMode.value = false
    selectedSlugs.value = new Set()
  }
  const toggle = (slug: string): void => {
    const next = new Set(selectedSlugs.value)
    /*
     * Toggle without an `if` (no-restricted-syntax forbids it).
     * A delete that was a no-op gets undone by the conditional add,
     * so the net effect is "flip membership".
     */
    const had = next.has(slug)
    next.delete(slug)
    selectedSlugs.value = had ? next : new Set([...next, slug])
  }
  return { selectMode, selectedSlugs, enter, exit, toggle }
}
