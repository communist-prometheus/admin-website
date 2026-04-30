<script setup lang="ts">
import { DRAWER_FILTERS, type DrawerFilter } from './drawer-filters'
import { DRAWER_TEST_IDS } from './test-ids'

defineProps<{ readonly active: DrawerFilter }>()
defineEmits<{ readonly select: [filter: DrawerFilter] }>()
</script>

<template>
  <nav class="drawer-filters" aria-label="Filter by kind">
    <button
      v-for="filter in DRAWER_FILTERS"
      :key="filter"
      type="button"
      :class="['filter-chip', { active: active === filter }]"
      :data-testid="`${DRAWER_TEST_IDS.filter}-${filter}`"
      :data-active="String(active === filter)"
      @click="$emit('select', filter)"
    >
      {{ filter }}
    </button>
  </nav>
</template>

<style scoped>
.drawer-filters {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.filter-chip {
  font-size: 0.75rem;
  padding: 2px 8px;
  border-radius: 12px;
  border: 1px solid var(--color-border, #ddd);
  background: transparent;
  cursor: pointer;
}

.filter-chip.active {
  background: var(--color-accent, #4fc3f7);
  color: #fff;
  border-color: transparent;
}
</style>
