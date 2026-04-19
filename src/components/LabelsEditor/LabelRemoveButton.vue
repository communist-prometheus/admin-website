<script setup lang="ts">
defineEmits<{ click: [] }>()
</script>

<template>
  <td class="remove-cell">
    <button
      type="button"
      class="remove-btn"
      data-testid="remove-label"
      aria-label="Remove label"
      @click="$emit('click')"
    >
      &times;
    </button>
  </td>
</template>

<style scoped>
.remove-btn {
  background: none;
  border: none;
  color: var(--color-text-secondary);
  font-size: 1.25rem;
  cursor: pointer;
  padding: 0.25rem 0.5rem;
  border-radius: var(--radius-sm);

  &:hover {
    color: var(--color-danger, #e53e3e);
    background: var(--color-surface);
  }
}
</style>
