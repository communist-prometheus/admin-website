<script setup lang="ts">
defineProps<{
  readonly title: string
  readonly active: boolean
}>()

defineEmits<{ enter: [] }>()
</script>

<template>
  <button
    type="button"
    class="group-row"
    :class="{ active }"
    :data-testid="`mobile-nav-group-${title.toLowerCase()}`"
    @click="$emit('enter')"
  >
    <span class="group-label">{{ title }}</span>
    <span class="group-chevron" aria-hidden="true">›</span>
  </button>
</template>

<style scoped>
/*
 * Single fixed-height row per group. The accordion pattern that used
 * to live here was "jumpy" — expanding a group changed the drawer's
 * height and shifted every sibling below it. This row is a leaf-level
 * navigation trigger: tap opens a subpanel; the drawer's overall
 * geometry never changes.
 */
.group-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  min-block-size: 40px;
  padding: 0.35rem 1rem 0.35rem 1.6rem;
  border: none;
  background: transparent;
  color: var(--color-text-primary);
  text-align: start;
  font-size: 0.95rem;
  font-weight: 500;
  cursor: pointer;
  border-radius: var(--radius-sm);
  transition: background var(--transition-fast);
}

.group-row:hover,
.group-row:focus-visible {
  background: var(--color-surface);
}

.group-row.active {
  color: var(--color-accent);
}

.group-chevron {
  font-size: 1.1rem;
  color: var(--color-text-secondary);
  line-height: 1;
}
</style>
