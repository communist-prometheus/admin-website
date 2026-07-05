<script setup lang="ts">
defineProps<{
  readonly title: string
}>()

defineEmits<{ close: [] }>()
</script>

<template>
  <header class="submenu-header">
    <span class="submenu-title">{{ title }}</span>
    <button
      type="button"
      class="submenu-close"
      aria-label="Close submenu"
      data-testid="mobile-submenu-close"
      @click="$emit('close')"
    >
      ×
    </button>
  </header>
</template>

<style scoped>
.submenu-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  padding: 0.25rem 0.4rem;
  border-block-end: 1px solid var(--color-border);
  margin-block-end: 0.25rem;
}

.submenu-title {
  font-size: 0.7rem;
  font-weight: 600;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: var(--color-text-secondary);
}

.submenu-close {
  min-inline-size: 28px;
  min-block-size: 28px;
  padding: 0;
  border: none;
  background: transparent;
  font-size: 1.2rem;
  line-height: 1;
  cursor: pointer;
  color: var(--color-text-secondary);
  border-radius: var(--radius-sm);
}

.submenu-close:hover,
.submenu-close:focus-visible {
  background: var(--color-surface);
  color: var(--color-text-primary);
}
</style>
