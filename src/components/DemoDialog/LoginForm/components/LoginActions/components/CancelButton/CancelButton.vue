<script setup lang="ts">
const emit = defineEmits<{ close: [] }>()
</script>

<template>
  <button
    type="button"
    class="btn-cancel"
    @click="emit('close')"
  >
    Cancel
  </button>
</template>

<style scoped>
.btn-cancel {
  padding: var(--space-md) var(--space-lg);
  border: var(--border-width) solid var(--color-border);
  border-radius: var(--border-radius-sm);
  background: transparent;
}
</style>
