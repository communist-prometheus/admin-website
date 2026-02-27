<script setup lang="ts">
import { RouterLink } from 'vue-router'
import AppNav from './AppNav.vue'
</script>

<template>
  <header class="app-header">
    <RouterLink to="/" class="logo">Prometheus</RouterLink>
    <AppNav />
    <slot name="actions" />
  </header>
</template>

<style scoped>
.app-header {
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
}

.logo:hover {
  color: var(--color-accent);
}
</style>
