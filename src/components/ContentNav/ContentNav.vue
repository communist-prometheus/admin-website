<script setup lang="ts">
import { RouterLink } from 'vue-router'

const navItems = [
  { path: '/content/blog', label: 'Blog' },
  { path: '/content/positions', label: 'Positions' },
  { path: '/content/pages', label: 'Pages' },
] as const
</script>

<template>
  <nav class="content-nav" data-testid="content-nav">
    <RouterLink
      v-for="item in navItems"
      :key="item.path"
      :to="item.path"
      class="nav-link"
    >
      {{ item.label }}
    </RouterLink>
  </nav>
</template>

<style scoped>
.content-nav {
  display: flex;
  gap: clamp(1rem, 3vw, 2rem);
  padding: clamp(1rem, 2vw, 1.5rem) 0;
  border-bottom: 1px solid var(--color-border);
}

.nav-link {
  padding: clamp(0.5rem, 1.5vw, 0.75rem) clamp(1rem, 2vw, 1.5rem);
  color: var(--color-text);
  text-decoration: none;
  font-size: clamp(0.875rem, 2vw, 1rem);
  font-weight: 500;
  border-radius: var(--radius-sm);
  transition: all 0.2s ease;

  &:hover {
    background: var(--color-background-soft);
  }

  &.router-link-active {
    background: var(--color-background-mute);
    color: var(--color-heading);
  }
}
</style>
