<script setup lang="ts">
import { computed } from 'vue'
import type { NavEntry } from '@/components/NavShared/nav-groups'
import { visibleGroups } from '@/components/NavShared/visible-groups'
import { useDraggableFab } from '@/composables/useDraggableFab'
import { t } from '@/i18n/t'
import { useAuthStore } from '@/stores/auth'
import { useRoleStore } from '@/stores/role'
import { fabPosition } from './fab-position'
import MobileMenuFab from './MobileMenuFab.vue'
import MobileMenuNav from './MobileMenuNav.vue'
import MobileMenuOverlay from './MobileMenuOverlay.vue'
import MobileNavLink from './MobileNavLink.vue'
import MobileSubmenuOverlay from './MobileSubmenuOverlay.vue'
import { useMenuState } from './use-menu-state'
import { useSubmenuState } from './use-submenu-state'

const { menuOpen, close, toggle } = useMenuState()
const fab = useDraggableFab()
const auth = useAuthStore()
const roleStore = useRoleStore()

const groups = computed(() =>
  auth.user ? visibleGroups(roleStore.role, auth.ssoRoles) : []
)
const fabOnRight = computed(() => fab.corner.value.endsWith('right'))
const submenu = useSubmenuState(groups, fabOnRight)

const style = computed(() =>
  fabPosition(fab.isDragging.value, fab.dragPos.value, fab.pos())
)

const labelFor = (item: NavEntry): string =>
  item.labelKey === undefined ? item.label : t(item.labelKey)

const onNavigate = (): void => {
  submenu.close()
  close()
}

const handlePointerup = (e: PointerEvent) => {
  fab.onPointerup(e)
  if (!fab.moved()) {
    submenu.close()
    toggle()
  }
}
</script>

<template>
  <MobileMenuFab
    :open="menuOpen"
    :fab-style="style"
    @pointerdown="fab.onPointerdown"
    @pointermove="fab.onPointermove"
    @pointerup="handlePointerup"
  />
  <MobileMenuOverlay :open="menuOpen" :corner="fab.corner.value">
    <MobileMenuNav
      @navigate="onNavigate"
      @open-submenu="submenu.open"
      @close-submenu="submenu.close"
    />
  </MobileMenuOverlay>
  <MobileSubmenuOverlay
    v-if="menuOpen && submenu.title.value"
    :style="submenu.style.value"
    :title="submenu.title.value"
    @close="submenu.close"
  >
    <MobileNavLink
      v-for="item in submenu.items.value"
      :key="item.path"
      :path="item.path"
      :label="labelFor(item)"
      @click="onNavigate"
    />
  </MobileSubmenuOverlay>
</template>
