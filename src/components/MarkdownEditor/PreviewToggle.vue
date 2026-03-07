<script setup lang="ts">
defineProps<{
  readonly previewing: boolean
}>()

defineEmits<{
  toggle: []
}>()
</script>

<template>
  <button
    type="button"
    class="preview-toggle"
    data-testid="preview-toggle"
    :aria-label="previewing ? 'Switch to editor' : 'Switch to preview'"
    @click="$emit('toggle')"
  >
    <span v-if="previewing" aria-hidden="true">&#9998;</span>
    <span v-else aria-hidden="true">&#128065;</span>
    {{ previewing ? 'Edit' : 'Preview' }}
  </button>
</template>

<style scoped>
.preview-toggle {
  align-self: flex-end;
  padding: clamp(0.25rem, 0.5vw, 0.375rem) clamp(0.5rem, 1vw, 0.75rem);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: transparent;
  color: var(--color-text);
  font-size: clamp(0.75rem, 1.5vw, 0.875rem);
  cursor: pointer;
  transition: background var(--transition-fast);

  &:hover {
    background: var(--color-background-soft);
  }
}
</style>
