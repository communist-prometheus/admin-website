<script setup lang="ts">
defineProps<{
  readonly label: string
  readonly value: string
  readonly testid: string
}>()

defineEmits<{
  readonly update: [next: string]
}>()
</script>

<template>
  <label class="text-field">
    <span class="text-field-label">{{ label }}</span>
    <input
      :value="value"
      type="text"
      :data-testid="testid"
      @input="$emit('update', ($event.target as HTMLInputElement).value)"
    >
  </label>
</template>

<style scoped>
.text-field {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  font-size: 0.875rem;
}

.text-field-label {
  color: var(--color-text-secondary);
}

input {
  padding: 0.4rem 0.5rem;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: var(--color-background);
  color: var(--color-text);
}
</style>
