<script setup lang="ts">
defineEmits<{
  cancel: []
  confirm: []
}>()
</script>

<template>
  <footer class="actions">
    <button
      type="button"
      class="btn-cancel"
      data-testid="hard-reset-cancel"
      @click="$emit('cancel')"
    >
      Cancel
    </button>
    <button
      type="button"
      class="btn-danger"
      data-testid="hard-reset-confirm-yes"
      @click="$emit('confirm')"
    >
      Yes, reset
    </button>
  </footer>
</template>

<style scoped>
.actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
}

.btn-cancel,
.btn-danger {
  padding: 0.4rem 0.85rem;
  border-radius: var(--radius-sm);
  font-size: 0.85rem;
  cursor: pointer;
}

.btn-cancel {
  border: 1px solid var(--color-border);
  background: transparent;
  color: var(--color-text-secondary);
}

.btn-danger {
  border: 1px solid var(--color-error, #e53935);
  background: transparent;
  color: var(--color-error, #e53935);
}

.btn-danger:hover,
.btn-danger:focus-visible {
  background: color-mix(in srgb, var(--color-error, #e53935) 12%, transparent);
}
</style>
