<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { useScrollHeader } from '@/composables/useScrollHeader'
import AppNav from './AppNav.vue'

const { offset } = useScrollHeader()
const headerStyle = computed(() => ({
  transform: `translateY(${offset.value}px)`,
}))
</script>

<template>
  <header
    class="app-header"
    :style="headerStyle"
  >
    <RouterLink to="/" class="logo">Prometheus</RouterLink>
    <AppNav />
    <slot />
  </header>
</template>

<style scoped>
.app-header {
  position: sticky;
  top: 0;
  z-index: var(--z-sticky);
  will-change: transform;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: clamp(0.75rem, 2vw, 1rem) clamp(1rem, 4vw, 2rem);
  border-bottom: 1px solid var(--color-border);
  background: var(--color-background);
  color: var(--color-heading);
  gap: clamp(2rem, 5vw, 4rem);
}

.logo {
  font-size: clamp(1.25rem, 3vw, 1.5rem);
  font-weight: 700;
  color: var(--color-heading);
  text-decoration: none;
  white-space: nowrap;
  min-height: 44px;
  display: inline-flex;
  align-items: center;
}

.logo:hover {
  color: var(--color-accent);
}
</style>
