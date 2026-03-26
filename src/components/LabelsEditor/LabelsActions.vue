<script setup lang="ts">
defineProps<{ readonly saving?: boolean }>()
defineEmits<{ add: []; save: [] }>()
</script>

<template>
  <button
    type="button"
    class="add-btn"
    data-testid="add-label"
    @click="$emit('add')"
  >
    + Add Label
  </button>
  <button
    type="button"
    class="save-btn"
    data-testid="save-labels"
    :disabled="saving"
    @click="$emit('save')"
  >
    {{ saving ? 'Saving...' : 'Save' }}
  </button>
</template>

<style scoped>
.add-btn {
  padding: 0.5rem 1rem;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  cursor: pointer;
  color: var(--color-text);
}

.save-btn {
  padding: 0.5rem 1.5rem;
  background: var(--color-accent);
  color: var(--color-on-accent, #fff);
  border: none;
  border-radius: var(--radius-sm);
  cursor: pointer;
  font-weight: 600;

  &:disabled {
    opacity: 50%;
    cursor: not-allowed;
  }
}
</style>
