<script setup lang="ts">
import type { CSSProperties } from 'vue'
import { lineStyle } from './fab-lines'
import { MOBILE_FAB } from './test-ids'

defineProps<{
  readonly open: boolean
  readonly fabStyle: CSSProperties
}>()
</script>

<template>
  <button
    type="button"
    class="mobile-fab"
    :style="fabStyle"
    :aria-expanded="open"
    aria-label="Navigation menu"
    :data-testid="MOBILE_FAB"
  >
    <span
      v-for="i in 3"
      :key="i"
      :style="lineStyle(i - 1, open)"
    />
  </button>
</template>

<style scoped>
.mobile-fab {
  position: fixed;
  z-index: var(--z-fab);
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: var(--color-accent);
  border: none;
  cursor: pointer;
  touch-action: none;
  padding: 0;
  box-shadow: var(--shadow-md);
  -webkit-tap-highlight-color: transparent;
  user-select: none;
  transition: transform var(--transition-fast), box-shadow var(--transition-fast);

  &:active {
    transform: scale(0.9);
    box-shadow: var(--shadow-sm);
  }
}

@media (width >= 768px) {
  .mobile-fab {
    display: none;
  }
}
</style>
