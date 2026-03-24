<script setup lang="ts">
defineProps<{ readonly value: string }>()
const emit = defineEmits<{ input: [value: string] }>()
</script>

<template>
  <td>
    <input
      :value="value"
      type="text"
      placeholder="en"
      maxlength="5"
      class="code-input"
      data-testid="language-code"
      @input="emit('input', ($event.target as HTMLInputElement).value)"
    />
  </td>
</template>

<style scoped>
.code-input {
  width: 4rem;
  padding: 0.375rem 0.5rem;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  font-family: var(--font-mono, monospace);
  background: var(--color-bg);
  color: var(--color-text);
}
</style>
