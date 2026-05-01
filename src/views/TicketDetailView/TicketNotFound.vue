<script setup lang="ts">
defineProps<{ readonly number: number }>()
defineEmits<{ back: [] }>()
</script>

<template>
  <p class="status">
    Ticket #{{ number }} not found.
    <button
      type="button"
      class="back"
      @click="$emit('back')"
    >
      Back to list
    </button>
  </p>
</template>

<style scoped>
.status {
  color: var(--color-text-secondary);
}

.back {
  margin-left: 0.5rem;
  border: none;
  background: transparent;
  color: var(--color-accent);
  cursor: pointer;
  font: inherit;
}
</style>
