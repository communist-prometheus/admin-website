<script setup lang="ts">
import TrashIcon from './TrashIcon.vue'

defineEmits<{ click: [] }>()
</script>

<template>
  <button
    type="button"
    class="delete-btn"
    data-testid="delete-item-btn"
    aria-label="Delete"
    @click.stop="$emit('click')"
  >
    <TrashIcon />
  </button>
</template>

<style scoped>
.delete-btn {
  visibility: hidden;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  padding: 0;
  border: none;
  border-radius: var(--radius-sm);
  background: transparent;
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: color 0.15s, background 0.15s;

  &:hover {
    color: var(--color-error, #e53935);
    background: color-mix(
      in srgb,
      var(--color-error, #e53935) 10%,
      transparent
    );
  }
}
</style>
