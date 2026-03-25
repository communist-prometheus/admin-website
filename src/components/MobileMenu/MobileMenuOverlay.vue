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
    class="mobile-popup"
    role="navigation"
    aria-label="Mobile navigation"
    :style="style"
    :data-testid="MOBILE_MENU"
  >
    <slot />
  </nav>
</template>

<style scoped>
.mobile-popup {
  position: fixed;
  right: 16px;
  bottom: 80px;
  z-index: 99;
  background: var(--color-surface-elevated);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: clamp(0.5rem, 2vw, 0.75rem);
  box-shadow: var(--shadow-lg);
  transition:
    opacity var(--transition-base),
    transform var(--transition-base);
}

@media (width >= 768px) {
  .mobile-popup {
    display: none;
  }
}
</style>
