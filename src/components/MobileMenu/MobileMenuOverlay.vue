<script setup lang="ts">
import { computed } from 'vue'
import { overlayStyle } from './overlay-style'
import { MOBILE_MENU } from './test-ids'

const props = defineProps<{
  readonly open: boolean
}>()

const style = computed(() => overlayStyle(props.open))
</script>

<template>
  <nav
    class="mobile-overlay"
    role="navigation"
    aria-label="Mobile navigation"
    :style="style"
    :data-testid="MOBILE_MENU"
  >
    <slot />
  </nav>
</template>

<style scoped>
.mobile-overlay {
  position: fixed;
  inset: 0;
  z-index: 99;
  background: var(--color-background);
  opacity: 98%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition:
    opacity var(--transition-base),
    transform var(--transition-base);
}

@media (width >= 768px) {
  .mobile-overlay {
    display: none;
  }
}
</style>
