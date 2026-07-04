<script setup lang="ts">
import { RouterLink, useRoute } from 'vue-router'

interface SectionEntry {
  readonly path: string
  readonly label: string
}

const SECTIONS: readonly SectionEntry[] = [
  { path: '/settings/languages', label: 'Languages' },
  { path: '/settings/links', label: 'Links' },
  { path: '/settings/members', label: 'Members' },
  { path: '/settings/history', label: 'Action history' },
  { path: '/settings/reset', label: 'Reset' },
]

const route = useRoute()

const isActive = (path: string): boolean => route.path === path
</script>

<template>
  <nav
    class="settings-nav"
    data-testid="settings-nav"
    aria-label="Settings sections"
  >
    <RouterLink
      v-for="entry in SECTIONS"
      :key="entry.path"
      :to="entry.path"
      :class="{ active: isActive(entry.path) }"
      :data-testid="`settings-nav-${entry.path.split('/').pop()}`"
    >
      {{ entry.label }}
    </RouterLink>
  </nav>
</template>

<style scoped>
/*
 * Sidebar on desktop, horizontal scroll on mobile. Keeps every section
 * one tap away instead of the old vertically-stacked flow where
 * Members lived past a full screen of Languages + Links + Labels
 * scrolling.
 */
.settings-nav {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
  padding: 0.5rem 0.25rem;
  min-inline-size: 12rem;
}

.settings-nav a {
  padding: 0.5rem 0.75rem;
  border-radius: var(--radius-sm);
  color: var(--color-text);
  text-decoration: none;
  font-size: 0.9rem;
}

.settings-nav a:hover,
.settings-nav a:focus-visible {
  background: var(--color-background-soft);
}

.settings-nav .active {
  background: var(--color-background-soft);
  color: var(--color-accent);
  font-weight: 600;
}

@media (width < 768px) {
  .settings-nav {
    flex-direction: row;
    overflow-x: auto;
    gap: 0.25rem;
    padding: 0.25rem 0.5rem;
    border-block-end: 1px solid var(--color-border);
    scrollbar-width: none;
  }

  .settings-nav::-webkit-scrollbar {
    display: none;
  }

  .settings-nav a {
    white-space: nowrap;
    padding: 0.4rem 0.75rem;
  }
}
</style>
