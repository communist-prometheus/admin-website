<script setup lang="ts">
import type { CSSProperties } from 'vue'
import MobileSubmenuHeader from './MobileSubmenuHeader.vue'

defineProps<{
  readonly style: CSSProperties
  readonly title: string
}>()

defineEmits<{ close: [] }>()
</script>

<template>
  <aside
    class="submenu-popup"
    role="menu"
    aria-label="Section items"
    :style="style"
    data-testid="mobile-submenu"
  >
    <MobileSubmenuHeader :title="title" @close="$emit('close')" />
    <slot />
  </aside>
</template>

<style scoped>
/*
 * Second-layer popup that sits ABOVE the main drawer without replacing
 * it. Main drawer stays visible and stationary; this popup floats on
 * top with an offset so both layers are legible. Tap on the backdrop
 * (or on a group row in the main drawer) closes it.
 */
.submenu-popup {
  position: fixed;
  z-index: 100;
  padding: 0.4rem;
  background: var(--color-surface-elevated);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-xl, 0 20px 50px rgb(0 0 0 / 40%));
  inline-size: min(15rem, calc(100vw - 3rem));
  animation: submenu-in 120ms ease;
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
}

@keyframes submenu-in {
  from {
    opacity: 0%;
    transform: translateX(-8px);
  }

  to {
    opacity: 100%;
    transform: translateX(0);
  }
}

@media (width >= 768px) {
  .submenu-popup {
    display: none;
  }
}
</style>
