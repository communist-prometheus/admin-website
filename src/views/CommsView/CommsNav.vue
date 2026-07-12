<script setup lang="ts">
import { RouterLink, useRoute } from 'vue-router'
import { t } from '@/i18n/t'

interface TabEntry {
  readonly path: string
  readonly label: string
}

const TABS: readonly TabEntry[] = [
  { path: '/comms/settings', label: t('comms.tabs.settings') },
  { path: '/comms/subscribers', label: t('comms.tabs.subscribers') },
  { path: '/comms/log', label: t('comms.tabs.log') },
]

const route = useRoute()

const isActive = (path: string): boolean => route.path === path
</script>

<template>
  <nav class="comms-nav" data-testid="comms-nav" aria-label="Newsletter sections">
    <RouterLink
      v-for="tab in TABS"
      :key="tab.path"
      :to="tab.path"
      :class="{ active: isActive(tab.path) }"
      :data-testid="`comms-nav-${tab.path.split('/').pop()}`"
    >
      {{ tab.label }}
    </RouterLink>
  </nav>
</template>

<style scoped>
.comms-nav {
  display: flex;
  gap: 0.25rem;
  overflow-x: auto;
  border-block-end: 1px solid var(--color-border);
  scrollbar-width: none;
}

.comms-nav::-webkit-scrollbar {
  display: none;
}

.comms-nav a {
  padding: 0.5rem 0.9rem;
  color: var(--color-text-secondary);
  text-decoration: none;
  font-size: 0.9rem;
  white-space: nowrap;
  border-block-end: 2px solid transparent;
}

.comms-nav a:hover,
.comms-nav a:focus-visible {
  color: var(--color-text-primary);
}

.comms-nav .active {
  color: var(--color-accent);
  border-block-end-color: var(--color-accent);
  font-weight: 600;
}
</style>
