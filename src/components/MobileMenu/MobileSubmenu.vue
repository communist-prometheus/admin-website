<script setup lang="ts">
import type { NavEntry } from '@/components/NavShared/nav-groups'
import { t } from '@/i18n/t'
import MobileNavLink from './MobileNavLink.vue'

defineProps<{
  readonly title: string
  readonly items: readonly NavEntry[]
}>()

defineEmits<{ back: []; navigate: [] }>()

const labelFor = (item: NavEntry): string =>
  item.labelKey === undefined ? item.label : t(item.labelKey)
</script>

<template>
  <div class="submenu" data-testid="mobile-submenu">
    <button
      type="button"
      class="back-row"
      data-testid="mobile-submenu-back"
      @click="$emit('back')"
    >
      ‹ {{ title }}
    </button>
    <MobileNavLink
      v-for="item in items"
      :key="item.path"
      :path="item.path"
      :label="labelFor(item)"
      @click="$emit('navigate')"
    />
  </div>
</template>

<style scoped>
.submenu {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.back-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  min-block-size: 40px;
  padding: 0.35rem 1rem;
  border: none;
  background: transparent;
  color: var(--color-text-primary);
  text-align: start;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  border-radius: var(--radius-sm);
  transition: background var(--transition-fast);
  border-block-end: 1px solid var(--color-border);
  margin-block-end: 0.15rem;
}

.back-row:hover,
.back-row:focus-visible {
  background: var(--color-surface);
}

.back-glyph {
  font-size: 1.3rem;
  line-height: 1;
  color: var(--color-text-secondary);
}
</style>
