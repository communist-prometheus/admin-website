<script setup lang="ts">
import { RouterLink, useRoute } from 'vue-router'
import type { NavEntry } from '@/components/NavShared/nav-groups'
import { t } from '@/i18n/t'

defineProps<{
  readonly items: readonly NavEntry[]
}>()

const route = useRoute()

const labelFor = (item: NavEntry): string =>
  item.labelKey === undefined ? item.label : t(item.labelKey)
</script>

<template>
  <div class="dropdown-menu" role="menu">
    <RouterLink
      v-for="item in items"
      :key="item.path"
      :to="item.path"
      role="menuitem"
      class="dropdown-item"
      :class="{ active: route.path.startsWith(item.path) }"
    >
      {{ labelFor(item) }}
    </RouterLink>
  </div>
</template>

<style scoped>
.dropdown-menu {
  position: absolute;
  inset-block-start: calc(100% + 0.25rem);
  inset-inline-start: 0;
  min-inline-size: 10rem;
  padding: 0.25rem;
  display: grid;
  gap: 0.1rem;
  background: var(--color-background);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  box-shadow: 0 6px 20px rgb(0 0 0 / 20%);
  z-index: 40;
}

.dropdown-item {
  padding: 0.4rem 0.6rem;
  color: var(--color-text);
  text-decoration: none;
  font-size: 0.9rem;
  border-radius: var(--radius-sm);
}

.dropdown-item:hover,
.dropdown-item:focus-visible {
  background: var(--color-background-soft);
}

.dropdown-item.active {
  color: var(--color-accent);
  font-weight: 600;
}
</style>
