<script setup lang="ts">
import { computed } from 'vue'
import { useDraggableFab } from '@/composables/useDraggableFab'
import { fabPosition } from './fab-position'
import MobileMenuFab from './MobileMenuFab.vue'
import MobileMenuNav from './MobileMenuNav.vue'
import MobileMenuOverlay from './MobileMenuOverlay.vue'
import { useMenuState } from './use-menu-state'

const { menuOpen, close, toggle } = useMenuState()
const fab = useDraggableFab()

const style = computed(() =>
  fabPosition(fab.isDragging.value, fab.dragPos.value, fab.pos())
)

const handlePointerup = (e: PointerEvent) => {
  fab.onPointerup(e)
  if (!fab.moved()) toggle()
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
  <MobileMenuOverlay :open="menuOpen">
    <MobileMenuNav @navigate="close" />
  </MobileMenuOverlay>
</template>
