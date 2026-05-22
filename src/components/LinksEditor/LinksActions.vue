<script setup lang="ts">
defineProps<{ readonly saving?: boolean }>()
defineEmits<{ add: []; save: [] }>()
</script>

<template>
  <footer class="links-actions">
    <button
      type="button"
      class="btn-add"
      data-testid="link-add"
      @click="$emit('add')"
    >
      + Add link
    </button>
    <button
      type="button"
      class="btn-save"
      :disabled="saving"
      data-testid="links-save"
      @click="$emit('save')"
    >
      {{ saving ? 'Saving…' : 'Save links' }}
    </button>
  </footer>
</template>

<style scoped>
.links-actions {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  margin-top: 1rem;
}

button {
  padding: 0.5rem 1rem;
  border-radius: var(--radius-sm);
  border: 1px solid var(--color-border);
  cursor: pointer;
  font-size: 0.875rem;
}

.btn-save {
  background: var(--color-accent, #1976d2);
  color: #fff;
  border: none;
}

.btn-save:disabled {
  opacity: 50%;
  cursor: not-allowed;
}
</style>
