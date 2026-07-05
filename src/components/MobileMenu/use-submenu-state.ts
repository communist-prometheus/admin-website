import { type ComputedRef, computed, type Ref, ref } from 'vue'
import type { NavEntry, NavGroup } from '@/components/NavShared/nav-groups'
import { submenuStyle } from './submenu-style'

/** Reactive state + handlers for the mobile submenu overlay. */
export interface SubmenuState {
  readonly title: ComputedRef<string | undefined>
  readonly items: ComputedRef<readonly NavEntry[]>
  readonly style: ComputedRef<Record<string, string>>
  readonly open: (payload: { title: string; anchor: DOMRect }) => void
  readonly close: () => void
}

interface Slots {
  readonly title: Ref<string | undefined>
  readonly anchor: Ref<DOMRect | undefined>
}

const buildComputed = (
  slots: Slots,
  groups: ComputedRef<readonly NavGroup[]>,
  fabOnRight: ComputedRef<boolean>
): Pick<SubmenuState, 'title' | 'items' | 'style'> => ({
  title: computed(() => slots.title.value),
  items: computed<readonly NavEntry[]>(
    () => groups.value.find(g => g.title === slots.title.value)?.items ?? []
  ),
  style: computed(() => submenuStyle({ anchor: slots.anchor, fabOnRight })),
})

/**
 * Extracted so MobileMenu.vue's `<script setup>` stays under the
 * sonarjs max-lines cap. Owns the `title` + `anchor` refs and exposes
 * the computed style consumed by MobileSubmenuOverlay.
 *
 * @param groups Reactive list of visible nav groups.
 * @param fabOnRight Reactive flag — whether the FAB is on the right
 *   corner (affects submenu inline anchoring).
 * @returns Reactive state + open/close handlers.
 */
export const useSubmenuState = (
  groups: ComputedRef<readonly NavGroup[]>,
  fabOnRight: ComputedRef<boolean>
): SubmenuState => {
  const slots: Slots = {
    title: ref<string | undefined>(undefined),
    anchor: ref<DOMRect | undefined>(undefined),
  }
  const open = (p: { title: string; anchor: DOMRect }): void => {
    slots.title.value = p.title
    slots.anchor.value = p.anchor
  }
  const close = (): void => {
    slots.title.value = undefined
    slots.anchor.value = undefined
  }
  return { ...buildComputed(slots, groups, fabOnRight), open, close }
}
