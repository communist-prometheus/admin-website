import { type Ref, ref } from 'vue'

/** Reactive set of slugs currently animating their delete. */
export interface DeletingState {
  readonly slugs: Ref<ReadonlySet<string>>
  readonly mark: (slug: string) => void
  readonly unmark: (slug: string) => void
}

/**
 * Build the deleting-set primitive used by the optimistic delete
 * UX: mark a slug before kicking the network call, unmark it once
 * the call resolves (or fails). Membership in the set drives the
 * fade-out animation on ContentListItem.
 * @returns A {slugs, mark, unmark} triple.
 */
export const createDeletingState = (): DeletingState => {
  const slugs = ref<ReadonlySet<string>>(new Set())
  const mark = (slug: string): void => {
    slugs.value = new Set([...slugs.value, slug])
  }
  const unmark = (slug: string): void => {
    const next = new Set(slugs.value)
    next.delete(slug)
    slugs.value = next
  }
  return { slugs, mark, unmark }
}
