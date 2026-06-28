<script setup lang="ts">
import { useNotificationDrawer } from '@/composables/useNotificationDrawer'
import { useNotificationsHistoryStore } from '@/stores/notifications-history'
import DrawerFilters from './DrawerFilters.vue'
import DrawerHeader from './DrawerHeader.vue'
import DrawerList from './DrawerList.vue'
import type { DrawerFilter } from './drawer-filters'
import { DRAWER_TEST_IDS } from './test-ids'

const drawer = useNotificationDrawer()
const history = useNotificationsHistoryStore()

const onSelectFilter = (next: DrawerFilter): void => {
  history.filter = next
}
const onItemDismiss = (id: string): void => {
  void history.removeEntry(id)
}
const onMarkAllRead = (): void => {
  void history.markAllRead()
}
const onClearAll = (): void => {
  void history.clear()
}
</script>

<template>
  <aside
    v-if="drawer.isOpen.value"
    class="drawer"
    role="dialog"
    aria-modal="true"
    aria-label="Notifications history"
    :data-testid="DRAWER_TEST_IDS.drawer"
  >
    <DrawerHeader
      @mark-read="onMarkAllRead"
      @clear="onClearAll"
      @close="drawer.close"
    />
    <DrawerFilters :active="history.filter" @select="onSelectFilter" />
    <DrawerList :entries="history.visible" @dismiss="onItemDismiss" />
  </aside>
</template>

<style scoped>
.drawer {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  width: min(360px, 100vw);
  z-index: 9991;
  background: var(--color-background, #fff);
  border-left: 1px solid var(--color-border, #ddd);
  box-shadow: -4px 0 12px rgb(0 0 0 / 8%);
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px;
  overflow-y: auto;
}

/*
 * Below the desktop breakpoint a 360px right-anchored panel left a
 * broken-looking sliver of the page exposed on the left (no scrim).
 * Span the full viewport instead so the drawer reads as a sheet.
 */
@media (width <= 768px) {
  .drawer {
    left: 0;
    width: auto;
  }
}
</style>
