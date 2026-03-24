<script setup lang="ts">
defineProps<{ readonly value: string }>()
const emit = defineEmits<{ input: [value: string] }>()
</script>

<template>
  <td>
    <input
      :value="value"
      type="text"
      placeholder="English"
      class="label-input"
      data-testid="language-label"
      @input="emit('input', ($event.target as HTMLInputElement).value)"
    />
  </td>
</template>

<style scoped>
.label-input {
  width: 100%;
  padding: 0.375rem 0.5rem;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: var(--color-bg);
  color: var(--color-text);
}
</style>
